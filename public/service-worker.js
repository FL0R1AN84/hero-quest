const CACHE_NAME = 'heroquest-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon.ico',
  '/manifest.json',
]

// Install event: cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Silently fail if any URL is not available during install
        console.log('[SW] Some URLs could not be cached during install')
      })
    }),
  )
  self.skipWaiting()
})

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event: network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Network-first strategy for HTML/JSON
  if (
    event.request.url.includes('.html') ||
    event.request.url.includes('.json') ||
    event.request.url === self.location.origin ||
    event.request.url === self.location.origin + '/'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Fall back to cache
          return caches.match(event.request)
        }),
    )
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})

// Listen for update check message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

