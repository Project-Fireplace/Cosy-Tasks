// service-worker.js

const CACHE_NAME = 'my-pwa-cache-v1'; // Change this to a new version (e.g., v2) when you update your app
const urlsToCache = [
    '/',           // Cache the root URL (usually your index.html)
    '/index.html', // Explicitly cache index.html
    // '/style.css',  // No longer needed - CSS is inlined
    // '/script.js', // No longer needed - JS is inlined
    '/manifest.json',
    '/images/icon-192.png',  // Cache your icon(s)
    '/images/icon-512.png',
    // Add any other static assets you want to cache here (images, fonts, etc.)
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to open cache:', err); // Add error handling
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream
                // and can only be consumed once.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(err => {
                                console.error('Failed to add response to cache:', err); // Add error handling
                            });

                        return response;
                    })
                    .catch(error => {
                        // Handle fetch errors (e.g., network issues)
                        console.error("Fetch failed:", error);
                        // Optionally, return a custom offline response here
                        // For example, you could return a cached "offline.html" page:
                        // return caches.match('/offline.html');
                    });
            })
    );
});



self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];  // IMPORTANT: Only keep the current cache

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches that aren't in the whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
