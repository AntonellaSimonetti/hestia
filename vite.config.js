import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      devOptions: {
        enabled: true,
      },

      includeAssets: [
        'imgs/logo.png',
        'imgs/logo-dark.png',
        'iconpwa-192x192.png',
        'iconpwa-512x512.png',
      ],

      manifest: {
        name: 'HestIA',
        short_name: 'HestIA',

        description:
          'Tu asistente culinario inteligente',

        theme_color: '#8A2E16',
        background_color: '#F5F8F5',

        display: 'standalone',

        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/iconpwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/iconpwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/iconpwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp}',
        ],
      },
    }),
  ],
})