import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
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

// https://vite.dev/config/
export default defineConfig({
  base: '/text-formatter/',
  plugins: [react(), buildInfoPlugin()],
})
