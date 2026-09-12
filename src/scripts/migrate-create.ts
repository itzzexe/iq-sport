/**
 * Creates a new migration from the current Payload schema:
 *   npm run migrate:create -- <name>
 *
 * (A plain tsx script rather than `payload migrate:create`, which can exit
 * before writing the files on Windows when its output is not a terminal.)
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

process.env.PAYLOAD_SEED_SKIP_ON_INIT = 'true'
process.env.PAYLOAD_MIGRATING = 'true'

async function main() {
  const migrationName = process.argv[2] || 'migration'
  const payload = await getPayload({ config })
  await payload.db.createMigration({ migrationName, payload })
  await payload.destroy()
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
