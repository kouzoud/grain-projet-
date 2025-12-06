import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.jpg', 'robots.txt'],
      manifest: {
        name: 'SolidarLink',
        short_name: 'SolidarLink',
        description: 'Plateforme d\'entraide humanitaire citoyenne.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'SolidarLink Mobile'
          },
          {
            src: '/screenshots/screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'SolidarLink Desktop'
          }
        ],
        categories: ['social', 'lifestyle', 'utilities'],
        shortcuts: [
          {
            name: 'Nouvelle demande',
            short_name: 'Demande',
            description: 'Créer une nouvelle demande d\'aide',
            url: '/citizen/declare',
            icons: [{ src: '/icons/shortcut-add.png', sizes: '96x96' }]
          },
          {
            name: 'Carte des missions',
            short_name: 'Carte',
            description: 'Voir les missions sur la carte',
            url: '/volunteer/map',
            icons: [{ src: '/icons/shortcut-map.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 heures
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  
  // ========== OPTIMISATIONS BUILD (PHASE 1) ==========
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          // State management
          'redux-vendor': [
            '@reduxjs/toolkit',
            'react-redux'
          ],
          // Map libraries
          'map-vendor': [
            'leaflet',
            'react-leaflet',
            'react-leaflet-cluster',
            'leaflet.heat',
            'leaflet-geosearch'
          ],
          // UI & Animation
          'ui-vendor': [
            'framer-motion',
            'recharts'
          ],
          // i18n
          'i18n-vendor': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector'
          ],
          // HTTP
          'http-vendor': [
            'axios'
          ],
          // Forms & Validation
          'forms-vendor': [
            'react-hook-form'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  
  // Optimisations dev
  server: {
    port: 5173,
    host: true
  },
  
  // Optimisations preview
  preview: {
    port: 4173,
    host: true
  }
})
