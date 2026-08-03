// Workbox configuration for Teachable Machine PWA optimization
module.exports = {
  // Source directory to scan for files to precache
  globDirectory: 'public/',
  
  // Files to precache (critical assets only)
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,eot,ico,json}',
    // MobileNet weight shards (model/groupNof1) have no file extension, so
    // the pattern above doesn't match them - needed for offline classifier use.
    'model/**'
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

  // Default 2MB limit is smaller than bundle.js (~2.4MB) and several
  // MobileNet weight shards (up to 4MB), so both would silently be skipped
  // from precaching. Raised with headroom for growth.
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
  
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
          maxAgeSeconds: 30 * 24 * 60 * 60 
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
          maxAgeSeconds: 7 * 24 * 60 * 60 
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
          maxAgeSeconds: 30 * 24 * 60 * 60 
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
          maxAgeSeconds: 30 * 24 * 60 * 60 
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
          maxAgeSeconds: 60 * 60 * 24 * 365 
        }
      }
    }
  ]
};
