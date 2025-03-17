// service-worker.js

const CACHE_NAME = 'my-pwa-cache-v6'; //  Incremented version! VERY IMPORTANT
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png',
    'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js', // Cache SortableJS
    'https://fonts.googleapis.com/icon?family=Material+Icons', // Cache Material Icons
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', // Cache Roboto Font

];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Failed to open cache:', err);
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

                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(err => {
                                console.error('Failed to add response to cache:', err);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error("Fetch failed:", error);
                        // You could add fallback content here for true offline capability
                    });
            })
    );
});



self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
