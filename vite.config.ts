import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

const root = fileURLToPath(new URL('./', import.meta.url))
const version: string = JSON.parse(readFileSync(`${root}package.json`, 'utf-8')).version

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

// Commit subjects since the previous version bump (release notes); empty if git history is unavailable.
function getReleaseNotes(): string[] {
  try {
    const bumps = git('log', '--format=%H', '-G"version"', '--', 'package.json').split('\n').filter(Boolean)
    const versionAt = (hash: string) => JSON.parse(git('show', `${hash}:package.json`)).version
    const previous = bumps[0] && versionAt(bumps[0]) === version ? bumps[1] : bumps[0]
    const range = previous ? `${previous}..HEAD` : 'HEAD'
    return git('log', range, '--no-merges', '--format=%s')
      .split('\n')
      .filter((subject) => subject && !subject.startsWith('chore: update dist'))
      .slice(0, 15)
  } catch {
    return []
  }
}

const releaseNotes = getReleaseNotes()

// Emits version.json and stamps the service worker so every release is a byte-different worker.
function releaseInfoPlugin(): Plugin {
  return {
    name: 'release-info',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version, notes: releaseNotes }),
      })
    },
    writeBundle(options) {
      const swPath = `${options.dir ?? `${root}dist`}/service-worker.js`
      if (!existsSync(swPath)) return
      writeFileSync(swPath, readFileSync(swPath, 'utf-8').replaceAll('__APP_VERSION__', version))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __RELEASE_NOTES__: JSON.stringify(releaseNotes),
  },
  plugins: [tailwindcss(), vue(), vueJsx(), vueDevTools(), releaseInfoPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
