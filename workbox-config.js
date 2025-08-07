// Workbox configuration for Teachable Machine PWA optimization
module.exports = {
  // Source directory to scan for files to precache
  globDirectory: 'public/',
  
  // Files to precache (critical assets only)
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,eot,ico,json}'
  ],
  
  // Files to exclude from precaching
  globIgnores: [
    '**/node_modules/**/*',
    '**/*.map',
    '**/workbox-*.js',
    '**/sw.js'
  ],
  
  // Service worker output file
  swDest: 'public/sw.js',
  
  // Skip waiting for better UX
  skipWaiting: true,
  clientsClaim: true,
  
  // Runtime caching strategies for different resource types
  runtimeCaching: [
    // Cache HTML pages with Network First strategy
    {
      urlPattern: ({request}) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
        networkTimeoutSeconds: 3
      }
    },
    
    // Cache JavaScript and CSS with Stale While Revalidate
    {
      urlPattern: ({request}) => 
        request.destination === 'script' || 
        request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'assets-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    
    // Cache images with Cache First strategy
    {
      urlPattern: ({request}) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    
    // Cache TensorFlow models and large assets
    {
      urlPattern: /\.(?:tfjs|bin|pb|json)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'ml-models-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    
    // Cache Google Fonts
    {
      urlPattern: ({url}) => url.origin === 'https://fonts.googleapis.com',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets'
      }
    },
    
    {
      urlPattern: ({url}) => url.origin === 'https://fonts.gstatic.com',
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    }
  ]
};
