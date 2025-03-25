const CACHE_NAME = 'cosy-tasks-v12';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/images/icon-96x96.png', // Add all your icon sizes
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
	// Add any other assets (fonts, images, etc.) you want to cache
	//Example: '/fonts/Roboto.woff2',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;600&display=swap', //Caching google fonts
    'https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5g.woff2',
    'https://fonts.gstatic.com/s/opensans/v28/memvYaGs126MiZpBA-UvWbX2vVnXBbObj2OVTSumu0SC55K5gw.woff2',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

// --- Install Event ---
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// --- Activate Event ---
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('cosy-tasks-') && cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// --- Fetch Event (Cache-First Strategy) ---
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// --- Push Notification Event (Basic Example) ---
self.addEventListener('push', event => {
    const title = 'Cosy Tasks'; // Or get title from event.data
    const options = {
        body: 'You have a new task!', // Or get body from event.data
        icon: 'images/icon-96x96.png',
        // ... other options
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
	const notification = event.notification;
    const action = event.action;
    const data = notification.data;

	event.waitUntil(
		self.clients.matchAll().then(clis => {
			const client = clis.find(c => {
				return c.visibilityState === 'visible';
			});
            // Send a message to the client
			const message = {
				type: 'notificationclick', //consistent naming
				notification: {
                    title: notification.title,
                    body: notification.body,
                    data: data
                }, //serialize
				action: action
			};

			if(client){
				client.postMessage(message);
			} else{
				// No visible client, so open a new window.
                // But, opening the window here doesn't guarantee it'll be ready *before* the main script
                // tries to show the task details. It's racy.
                if (self.clients.openWindow) { //check if openWindow is supported
                   self.clients.openWindow('/'); // Open root. Let main script handle showing details
                }
			}


		})
	);
});

self.addEventListener('notificationclose', (event) => {
	const notification = event.notification;
    const data = notification.data;

	event.waitUntil(
		self.clients.matchAll().then(clis => {
			const client = clis.find(c => {
				return c.visibilityState === 'visible';
			});
			// Send a message to the client
			const message = {
				type: 'notificationclose', //consistent naming
				notification: {
                    title: notification.title,
                    body: notification.body,
                    data: data
                }, //serialize
			};

			if(client)
				client.postMessage(message);

			//Don't open window
		})
	);
});

// --- Background Sync (Example) ---
self.addEventListener('sync', event => {
    if (event.tag === 'sync-new-tasks') {
       // event.waitUntil(syncTasks()); // Implement syncTasks function
    }
});

// Example syncTasks function (would need to interact with a server)
/*
async function syncTasks() {
    // Get tasks from IndexedDB (or wherever you store them for syncing)
    // Send tasks to the server
    // Update IndexedDB on success
}
*/
