/**
 * Runs before `next dev`.
 *
 * The Next.js dev server keeps its manifests in `.next/dev`. When several
 * routes compile at the same moment (a browser restoring many tabs), two
 * workers can write `prerender-manifest.json` concurrently and leave a torn
 * file behind — every request then fails with
 * "SyntaxError: Unexpected non-whitespace character after JSON".
 * OneDrive / antivirus file locking makes this more likely.
 *
 * This script validates every manifest and, if any is corrupt, removes the
 * dev cache so the next start is clean. Nothing of yours lives in `.next`.
 */
import fs from 'node:fs'
import path from 'node:path'

const devDir = path.resolve(process.cwd(), '.next', 'dev')

function corruptManifests(dir: string): string[] {
  const bad: string[] = []
  const walk = (d: string) => {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        // Turbopack's own cache and vendored modules are not ours to validate.
        if (e.name === 'cache' || e.name === 'node_modules' || e.name === 'static' || e.name === 'chunks') continue
        walk(p)
      } else if (e.name.endsWith('manifest.json')) {
        try {
          JSON.parse(fs.readFileSync(p, 'utf8'))
        } catch {
          bad.push(p)
        }
      }
    }
  }
  walk(dir)
  return bad
}

if (fs.existsSync(devDir)) {
  const bad = corruptManifests(devDir)
  if (bad.length > 0) {
    console.warn(`[dev] corrupt Next.js dev manifest(s) found — resetting .next/dev:\n  ${bad.map((b) => path.relative(process.cwd(), b)).join('\n  ')}`)
    fs.rmSync(devDir, { recursive: true, force: true })
  }
}
