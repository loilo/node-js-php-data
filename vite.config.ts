import { defineConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/node-js-php-data/'

export default defineConfig({
  root: './demo',
  base,
  resolve: {
    alias: {
      '@fontsource/jetbrains-mono': '@fontsource/jetbrains-mono'
    }
  },
  plugins: [
    nodePolyfills({
      include: ['path']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'JS to PHP data',
        short_name: 'JS to PHP data',
        description: 'Convert JavaScript data structures to PHP.',
        lang: 'en',
        display: 'fullscreen',
        background_color: '#1c202b',
        theme_color: '#1c202b',
        icons: [
          ...[120, 152, 167, 180, 1024].map(size => ({
            src: `${base}icons/ios_${size}x${size}.png`,
            sizes: `${size}x${size}`,
            types: 'image/png'
          })),
          {
            src: `${base}icons/ios_1024x1024.png`,
            sizes: '1024x1024',
            type: 'image/png'
          },
          ...[48, 72, 96, 144, 168, 192, 512].map(size => ({
            src: `${base}icons/android_${size}x${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: 'any'
          })),
          {
            src: `${base}icons/maskable.png`,
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    include: ['../test/*.test.js']
  }
})
