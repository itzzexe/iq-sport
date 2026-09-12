import fs from 'node:fs'
import path from 'node:path'
import { sql } from '@payloadcms/db-sqlite'
import type { Payload } from 'payload'
import { seed } from './index'

const LOCK_STALE_MS = 10 * 60 * 1000
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Folder next to the SQLite file (or ./data) where the seed lock lives. */
function dataDir() {
  const url = process.env.DATABASE_URL || 'file:./data/iq-sport.db'
  const dir = url.startsWith('file:')
    ? path.dirname(path.resolve(process.cwd(), url.slice('file:'.length)))
    : path.resolve(process.cwd(), 'data')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * SQLite tuning for a web server: WAL lets readers proceed while another
 * process writes (e.g. the seed running in a sibling build worker), and a busy
 * timeout makes a briefly locked database wait instead of throwing.
 * No-ops on non-SQLite adapters and on remote libSQL.
 */
async function tuneSqlite(payload: Payload) {
  const drizzle = (payload.db as unknown as { drizzle?: { run: (q: unknown) => Promise<unknown> } }).drizzle
  if (!drizzle) return
  try {
    await drizzle.run(sql`PRAGMA busy_timeout = 8000`)
    await drizzle.run(sql`PRAGMA journal_mode = WAL`)
  } catch {
    /* remote or read-only database — fine */
  }
}

const isLocked = (err: unknown) => /locked|busy/i.test(err instanceof Error ? err.message : String(err))
const noTables = (err: unknown) => /no such table/i.test(err instanceof Error ? err.message : String(err))

/** Reads the marker the seed writes last. Retries while another process holds the write lock. */
async function isSeeded(payload: Payload, attempts = 20): Promise<boolean> {
  for (let i = 0; ; i++) {
    try {
      const settings = await payload.findGlobal({ slug: 'settings', depth: 0, overrideAccess: true })
      return Boolean(settings?.seededAt)
    } catch (err) {
      if (isLocked(err) && i < attempts) {
        await sleep(300)
        continue
      }
      throw err
    }
  }
}

/**
 * Runs once, on the first start against an empty database, and fills the CMS
 * with the launch content so the site is never blank.
 *
 * `next build` renders pages in several worker processes that all initialise
 * Payload; an exclusive lock file makes sure exactly one of them seeds while
 * the others wait for it to finish. Set PAYLOAD_SEED=false to disable.
 */
export async function ensureSeeded(payload: Payload) {
  if (process.env.PAYLOAD_SEED === 'false') return
  if (process.env.PAYLOAD_SEED_SKIP_ON_INIT === 'true') return
  // On Vercel the seed runs once during the build (prebuild → `npm run seed`):
  // functions are short-lived and their filesystem is read-only.
  if (process.env.VERCEL === '1') return

  await tuneSqlite(payload)

  try {
    if (await isSeeded(payload)) return
  } catch (err) {
    if (noTables(err)) {
      // Migrations have not run yet (e.g. a CLI command); nothing to seed into.
      payload.logger.warn('[seed] tables missing — run `npm run migrate` first; skipping seed')
      return
    }
    throw err
  }

  const lockPath = path.join(dataDir(), '.seed.lock')
  let fd: number | null = null
  for (let attempt = 0; fd === null; attempt++) {
    try {
      const stat = fs.statSync(lockPath)
      if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) fs.unlinkSync(lockPath)
    } catch {
      /* no lock */
    }
    try {
      fd = fs.openSync(lockPath, 'wx')
      break
    } catch {
      if (attempt === 0) payload.logger.info(`[seed] waiting for another process to finish seeding (pid ${process.pid})`)
    }
    // Another process holds the lock: wait for it, tolerating locked reads,
    // then re-check. If it finished, we are done; if it died, we take over.
    for (let i = 0; i < 300 && fs.existsSync(lockPath); i++) await sleep(500)
    try {
      if (await isSeeded(payload)) return
    } catch (err) {
      if (!isLocked(err)) throw err
    }
    if (attempt >= 3) throw new Error('[seed] could not obtain the seed lock')
  }

  try {
    if (await isSeeded(payload)) return
    payload.logger.info(`[seed] empty database detected — writing launch content (pid ${process.pid})`)
    await seed(payload)
  } catch (err) {
    payload.logger.error({ err }, '[seed] failed')
    throw err
  } finally {
    if (fd !== null) fs.closeSync(fd)
    try {
      fs.unlinkSync(lockPath)
    } catch {
      /* already gone */
    }
  }
}
