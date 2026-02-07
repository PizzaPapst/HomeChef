import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path" // <--- WICHTIG: Dieser Import muss da sein!

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'HomeChef',
        theme_color: '#ffffff',
        icons: [] // (Hier deine Icons Config lassen)
      }
    })
  ],
  // --- DAS HIER FEHLT WAHRSCHEINLICH: ---
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})