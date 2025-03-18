// js/lib/notifications.js

export function sendNotification(title, body, taskData) {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notification');
        return;
    }

    if (Notification.permission === 'granted') {
        showNotification(title, body, taskData);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(title, body, taskData);
            }
        });
    }
}
function showNotification(title, body, taskData){
    if('serviceWorker' in navigator){
       navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body: body,
            icon: 'assets/icons/icon-192x192.png',
            data: {taskId: taskData.id}, //Pass task ID,
              actions: [  // Notification actions
                { action: 'complete', title: 'Complete' },
                { action: 'snooze', title: 'Snooze' }
            ]
          });
       })
    }
    else{
        //Fallback for browsers without service worker support (basic notification)
          new Notification(title, { body: body });
    }
}
