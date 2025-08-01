// Teachable Machine Service Worker

const CACHE_NAME = 'teachable-machine-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/fb.html',
  '/bundle.js',
  '/manifest.json',
  '/style.css',
  '/assets/teachable-handdrawn.svg',
  '/assets/machine-handdrawn.svg',
  '/assets/footer.svg',
  '/assets/intro.svg',
  '/assets/cam-icon.svg',
  '/assets/mic-icon.svg',
  '/assets/speaker-icon.svg',
  '/assets/play-icon.svg',
  '/assets/teachable-machine-splash-desktop.svg',
  '/assets/teachable-machine-splash-mobile.svg',
  '/assets/static/favicon/android-chrome-192x192.png',
  '/assets/static/favicon/android-chrome-512x512.png',
  '/assets/static/favicon/favicon.ico',
  '/offline.html' 
];

// Install event – cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate event – clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event – cache-first strategy, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Not in cache – fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Skip invalid responses
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        // Cache valid response
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (!event.request.url.includes('/api/')) {
            cache.put(event.request, responseClone);
          }
        });

        return networkResponse;
      }).catch((error) => {
        console.error('Fetch failed:', error);

        // Serve fallback offline page
        if (event.request.mode === 'navigate' || 
            (event.request.method === 'GET' && 
             event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('/offline.html');
        }
        
        // For image requests, return a placeholder
        if (event.request.destination === 'image') {
          return new Response('', {
            status: 200,
            statusText: 'OK'
          });
        }
      });
    })
  );
});