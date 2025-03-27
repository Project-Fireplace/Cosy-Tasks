document.addEventListener('DOMContentLoaded', () => {
    // Check for IndexedDB support
    if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported! Tasks will not be saved.');
        // Maybe show a message to the user
        return;
    }

    // Initialize Database
    Db.init()
        .then(() => {
            console.log('Database initialized.');
            Ui.renderTasks(); // Initial render
            // Set default theme based on user preference or system setting?
            Ui.applyTheme(localStorage.getItem('theme') || 'light');
        })
        .catch(error => {
            console.error('Error initializing database:', error);
            // Show error state to user
        });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registered with scope:', registration.scope))
            .catch(error => console.log('Service Worker registration failed:', error));
    }

    // === Event Listeners ===

    // Quick Add Task
    const quickAddInput = document.getElementById('quick-add-input');
    const quickAddButton = document.getElementById('quick-add-button');
    quickAddButton.addEventListener('click', handleQuickAdd);
    quickAddInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuickAdd();
        }
    });

    function handleQuickAdd() {
        const title = quickAddInput.value.trim();
        if (title) {
            Db.addTask({ title }) // Assumes Db.addTask returns a promise
                .then(() => {
                    quickAddInput.value = ''; // Clear input
                    Ui.renderTasks(); // Re-render task list
                    // Optional: Show success feedback
                })
                .catch(error => console.error('Error adding task:', error));
        }
    }

    // Task List Clicks (Event Delegation for complete/delete)
    const taskList = document.getElementById('task-list');
    taskList.addEventListener('click', (e) => {
        const taskElement = e.target.closest('li[data-task-id]');
        if (!taskElement) return;
        const taskId = parseInt(taskElement.dataset.taskId, 10);

        // Checkbox click
        if (e.target.matches('input[type="checkbox"]')) {
            const isCompleted = e.target.checked;
            Db.updateTask(taskId, { completed: isCompleted })
                .then(() => Ui.renderTasks()) // Could optimize to just update the single item
                .catch(err => console.error("Error updating task completion", err));
        }

        // Delete button click (assuming a delete button exists in the li)
        if (e.target.closest('.delete-task-button')) {
             // Add confirmation dialog logic here
             if (confirm('Are you sure you want to delete this task?')) {
                Db.deleteTask(taskId)
                    .then(() => Ui.renderTasks())
                    .catch(err => console.error("Error deleting task", err));
             }
        }

         // Edit button click / Task title click for inline edit?
         // Details button click?
    });

    // Settings Button
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    settingsButton.addEventListener('click', () => {
         Ui.openModal(settingsModal); // Assumes Ui.openModal function exists
    });

    // Add listeners for modal close buttons, project/filter clicks, theme changes etc.
    // ...

    // Request Notification Permission (maybe on first reminder setting?)
    // Notifications.requestPermission();

}); // End DOMContentLoaded

// Global helper (or move to Ui module)
function showFeedback(message, type = 'info') {
    // Implement a way to show temporary messages to the user
    console.log(`[${type}] ${message}`);
    // e.g., create a toast notification element
}
