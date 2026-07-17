import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')

// ── Service Worker Registration & Update Handling ────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('[SW] Registration successful:', registration.scope)

      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update()
      }, 60000)

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available - dispatch custom event
            window.dispatchEvent(
              new CustomEvent('sw-update-available', {
                detail: { registration },
              }),
            )
            console.log('[SW] New version available')
          }
        })
      })
    })
  })
}


