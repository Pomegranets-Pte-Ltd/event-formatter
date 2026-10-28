import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { getBuildInfo } from './scripts/buildInfo.js'

const buildInfoModule = 'virtual:build-info'

function buildInfoPlugin() {
  return {
    name: 'build-info',
    resolveId(id) {
      if (id === buildInfoModule) return `\0${buildInfoModule}`
    },
    load(id) {
      if (id !== `\0${buildInfoModule}`) return
      const info = getBuildInfo(fileURLToPath(new URL('.', import.meta.url)))
      return `export default ${JSON.stringify(info)}`
    },
  }
}

function faviconVersionPlugin() {
  return {
    name: 'favicon-version',
    transformIndexHtml(html) {
      const version = createHash('sha256')
        .update(readFileSync(new URL('./public/favicon.svg', import.meta.url)))
        .digest('hex')
        .slice(0, 12)
      return html.replace('__FAVICON_HASH__', version)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/event-formatter/',
  plugins: [react(), buildInfoPlugin(), faviconVersionPlugin()],
})
