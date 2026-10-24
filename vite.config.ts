import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

const root = fileURLToPath(new URL('./', import.meta.url))
const version: string = JSON.parse(readFileSync(`${root}package.json`, 'utf-8')).version

// Stamps the service worker so every release is a byte-different worker.
function releaseInfoPlugin(): Plugin {
  return {
    name: 'release-info',
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
  },
  plugins: [tailwindcss(), vue(), vueJsx(), vueDevTools(), releaseInfoPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
