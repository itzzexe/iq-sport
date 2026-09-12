/**
 * Applies pending database migrations (src/migrations), then exits.
 * Used by `npm run migrate` and automatically before `dev` / `build`.
 *
 * (A plain tsx script rather than `payload migrate`: the Payload CLI's in-process
 * tsx loader can exit early on Windows when stdout is not a TTY.)
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

process.env.PAYLOAD_SEED_SKIP_ON_INIT = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

async function main() {
  const payload = await getPayload({ config })
  await payload.db.migrate()
  payload.logger.info('[migrate] database is up to date')
  await payload.destroy()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
