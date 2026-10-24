// Bumps the package.json version based on a Conventional Commit message.
// Usage: node scripts/bump-version.mjs <commit-message-file>
//   feat                          -> minor + 1, patch = 0
//   fix, refactor, chore, docs, … -> patch + 1
// Digits roll over decimally: x.y.9 -> x.(y+1).0 and x.9.z -> (x+1).0.0
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const MAX = 9

export function bumpType(message) {
  const subject = message.split('\n')[0] ?? ''
  if (/^(Merge|Revert) /.test(subject)) return null
  const match = /^(\w+)(?:\([^)]*\))?(!)?:/.exec(subject)
  if (!match) return null
  return match[1] === 'feat' ? 'minor' : 'patch'
}

export function bumpVersion(version, type) {
  let [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)
  if (type === 'minor') {
    minor += 1
    patch = 0
  } else {
    patch += 1
  }
  if (patch > MAX) {
    patch = 0
    minor += 1
  }
  if (minor > MAX) {
    minor = 0
    major += 1
  }
  return `${major}.${minor}.${patch}`
}

function main() {
  const messageFile = process.argv[2]
  if (!messageFile) return
  const type = bumpType(readFileSync(messageFile, 'utf-8'))
  if (!type) return

  const pkgPath = fileURLToPath(new URL('../package.json', import.meta.url))
  const raw = readFileSync(pkgPath, 'utf-8')
  const current = /"version":\s*"([^"]+)"/.exec(raw)?.[1]
  if (!current) return
  const next = bumpVersion(current, type)
  writeFileSync(pkgPath, raw.replace(`"version": "${current}"`, `"version": "${next}"`))
  console.log(`[version] ${current} -> ${next}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main()
