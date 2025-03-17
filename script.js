// --- JavaScript ---

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('Service Worker registered! Scope is: ', registration.scope))
            .catch(error => console.log('Service Worker registration failed: ', error));
    });
}

// --- DOM Element References ---
const task
