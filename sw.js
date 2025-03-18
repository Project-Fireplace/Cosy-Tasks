const CACHE_NAME = 'cosy-tasks-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/data.js',
    '/js/settings.js',
    '/js/lib/idb.js',
  '/js/lib/notifications.js',
    '/js/components/TaskList.js',
    '/js/components/TaskItem.js',
    '/css/utilities.css',
    '/css/components/task-list.css',
    '/css/components/task-item.css',
    '/css/components/toolbar.css'

    // Add other assets to cache
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return from cache
                }
                return fetch(event.request); // Fetch from network
            })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // List of caches to keep

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || 'assets/icons/icon-192x192.png', // Default icon
    badge: data.badge || 'assets/icons/badge.png', // Badge for notification
    vibrate: data.vibrate || [200, 100, 200], // Vibration pattern
    data: data.data || {}, // Pass custom data to notification
    actions: data.actions || [  // Notification actions
      { action: 'complete', title: 'Complete' },
      { action: 'snooze', title: 'Snooze' }
    ]
  };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action;
  const taskData = event.notification.data;

  if (action === 'complete') {
    // Handle task completion (update IndexedDB, etc.)
    console.log('Task completed from notification', taskData);
    //You'd need to communicate with the main app here;
    //One common way is using postMessage to the client.
     clients.matchAll().then(clients => {
        if (clients && clients.length) {
          clients[0].postMessage({
            type: 'TASK_COMPLETED',
            taskId: taskData.taskId
          });
        }
      });


  } else if (action === 'snooze') {
    // Handle snoozing (reschedule notification)
        console.log('Task snoozed from notification', taskData);
        clients.matchAll().then(clients => {
        if (clients && clients.length) {
          clients[0].postMessage({
            type: 'TASK_SNOOZED',
            taskId: taskData.taskId
          });
        }
      });
  } else {
    // Default action: open the app
        clients.openWindow('/'); //Opens main app
  }
});
