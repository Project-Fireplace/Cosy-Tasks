// sw.js - Basic Service Worker for Offline Caching (Cache First Strategy)

const CACHE_NAME = 'cosy-tasks-cache-v1'; // Increment version to force update
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/db.js',
    '/js/ui.js',
    '/js/notifications.js', // If you have it
    '/manifest.json',
    // Add paths to Material Icons font files if hosting locally
    'https://fonts.googleapis.com/icon?family=Material+Icons', // Cache font CSS
    'https://fonts.gstatic.com/s/materialicons/vXXX/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2', // Cache actual font file (find exact URL via DevTools)
    // Add paths to icons in /icons/
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-144x144.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/maskable_icon.png'
    // Add other essential assets (images, fonts)
];

// Install: Cache essential assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activate worker immediately
            .catch(error => console.error('Service Worker: Caching failed', error))
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch: Serve from cache first, fallback to network
self.addEventListener('fetch', event => {
    // Ignore non-GET requests
    if (event.request.method !== 'GET') return;

    // For HTML navigation requests, use Network first then Cache (Stale-While-Revalidate might be better)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If network successful, cache the response (optional, good for updates)
                    // Be careful caching dynamic HTML responses if they vary
                    // if (response.ok) {
                    //     let responseToCache = response.clone();
                    //     caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                    // }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(event.request)
                           .then(cachedResponse => cachedResponse || caches.match('/index.html')); // Fallback to index
                })
        );
        return;
    }

    // For other static assets (CSS, JS, Images), use Cache First
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    // console.log('SW: Serving from cache:', event.request.url);
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                // console.log('SW: Fetching from network:', event.request.url);
                return fetch(event.request).then(networkResponse => {
                    // Optional: Cache the new response for future use
                    if (networkResponse && networkResponse.status === 200) {
                         // Only cache successful responses & assets we want to cache
                         if (urlsToCache.includes(new URL(event.request.url).pathname) || event.request.url.startsWith('https://fonts.gstatic.com')) {
                            let responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseToCache));
                         }
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('SW: Fetch failed; returning offline fallback if available.', error);
                    // Optionally return a fallback image or asset here
                    // e.g., if (event.request.url.endsWith('.png')) return caches.match('/images/offline-fallback.png');
                });
            })
    );
});

// Add listeners for 'push' (if using Push API - complex on static) or 'notificationclick'
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.notification.tag);
    event.notification.close();
    // Focus or open the app window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/'); // Open the app if not already open
        })
    );
});
