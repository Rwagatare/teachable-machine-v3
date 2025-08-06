// Teachable Machine Service Worker - Enhanced PWA Version

console.log('Service Worker script loaded');

// Detect development environment
const isDevelopment = self.location.hostname === 'localhost' || 
                     self.location.hostname === '127.0.0.1' || 
                     self.location.hostname.includes('192.168') ||
                     self.location.hostname.includes('10.');

if (isDevelopment) {
  console.log('🔧 Service Worker running in development mode');
}

const CACHE_NAME = 'teachable-machine-v1.2';
const OFFLINE_URL = '/index.html';

// Essential assets for offline functionality
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/bundle.js',
  '/style.css'
];

// Additional assets to cache when available
const ASSETS_TO_CACHE = [
  '/fb.html',
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
  '/assets/static/favicon/favicon-152.png',
  '/assets/static/favicon/favicon-192.png',
  '/assets/static/favicon/favicon.ico',
  '/assets/static/share-image.jpg'
];

// Install event – cache essential files first, then additional assets
self.addEventListener('install', (event) => {
  console.log('SW installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW caching core assets');
        // Cache core assets first (critical for app to work)
        return cache.addAll(CORE_ASSETS)
          .catch((error) => {
            console.error('Failed to cache core assets:', error);
            
            if (isDevelopment) {
              console.warn('🔧 Development: Continuing despite cache errors');
              return Promise.resolve();
            }
            
            // In production, we want to know about cache failures
            throw error;
          });
      })
      .then(() => {
        if (isDevelopment) {
          console.log('SW skipping additional assets in development');
          return Promise.resolve();
        }
        
        console.log('SW caching additional assets');
        // Cache additional assets (nice to have) - only in production
        return caches.open(CACHE_NAME).then((cache) => {
          return Promise.allSettled(
            ASSETS_TO_CACHE.map((url) =>
              cache.add(url).catch((err) => {
                console.warn(`Failed to cache ${url}:`, err);
                return null;
              })
            )
          );
        });
      })
      .then(() => {
        console.log('SW installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW installation failed:', error);
        
        if (isDevelopment) {
          console.warn('🔧 Development: Service worker installation failed, but continuing...');
          return self.skipWaiting();
        }
        
        throw error;
      })
  );
});

// Activate event – clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('SW activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW activated and ready');
        return self.clients.claim();
      })
  );
});

// Fetch event – enhanced caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Chrome extension requests
  if (event.request.url.includes('chrome-extension://')) return;
  
  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then((networkResponse) => {
              // Cache successful responses
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Offline fallback for navigation
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Handle other requests (assets, API calls, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache if available
          return cachedResponse;
        }

        // Not in cache – fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Skip invalid responses
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse;
            }

            // Cache valid responses (except API calls)
            if (!event.request.url.includes('/api/')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);

            // For image requests, return a placeholder
            if (event.request.destination === 'image') {
              return new Response('', {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            }
            
            // For other failed requests, throw the error
            throw error;
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle any background tasks here
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Push message received');
  // Handle push notifications here if needed
});