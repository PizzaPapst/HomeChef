import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate', // Updates werden sofort geladen
      manifest: {
        name: 'HomeChef',
        short_name: 'HomeChef',
        description: 'Mein persönlicher Rezeptmanager',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Sieht aus wie eine native App (keine Browserleiste)
        scope: '/',
        start_url: '/',
        icons: [
          // Hier sucht er später nach Icons (müssen wir später noch erstellen)
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})