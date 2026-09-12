/**
 * CLI entry:  npm run seed          → seeds only if the database is still empty
 *             npm run seed:reset    → deletes ALL content and media, then seeds again
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { resetContent, seed } from './index'

process.env.PAYLOAD_SEED_SKIP_ON_INIT = 'true'

async function main() {
  const reset = process.argv.includes('--reset')
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0 })

  if (reset) {
    payload.logger.warn('[seed] --reset: deleting all content and media')
    await resetContent(payload)
  } else if (settings.seededAt) {
    payload.logger.info(`[seed] already seeded on ${settings.seededAt}. Use "npm run seed:reset" to start over.`)
    process.exit(0)
  }

  await seed(payload)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
