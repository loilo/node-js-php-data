import { defineConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: './demo',
  base: '/node-js-php-data/',
  resolve: {
    alias: {
      '@fontsource/jetbrains-mono': '@fontsource/jetbrains-mono'
    }
  },
  plugins: [
    nodePolyfills({
      include: ['path']
    }),
    VitePWA({ registerType: 'autoUpdate' })
  ],
  test: {
    globals: true,
    include: ['../test/*.test.js']
  }
})
