// js/ui.js - Handles rendering and UI updates
const Ui = (() => {
    const taskListElement = document.getElementById('task-list');
    const currentViewTitle = document.getElementById('current-view-title');
    // Get references to other UI elements (modals, sidebar lists etc.)

    function renderTasks(filter = 'all', sort = 'createdAt', projectId = null) {
        // Update title based on filter/project
        currentViewTitle.textContent = `Tasks (${filter})`; // Simplify title logic

        Db.getTasks(filter, sort, projectId)
            .then(tasks => {
                taskListElement.innerHTML = ''; // Clear current list
                if (tasks.length === 0) {
                    taskListElement.innerHTML = '<li class="empty-state">No tasks found!</li>';
                    return;
                }

                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.dataset.taskId = task.id;
                    li.classList.toggle('completed', task.completed);

                    // Basic Task Structure (Improve this significantly)
                    li.innerHTML = `
                        <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task ${task.completed ? 'incomplete' : 'complete'}">
                        <span class="task-title">${escapeHTML(task.title)}</span>
                        ${task.dueDate ? `<span class="task-due-date">${formatDate(task.dueDate)}</span>` : ''}
                        <button class="icon-button delete-task-button" aria-label="Delete task">
                            <span class="material-icons">delete_outline</span>
                        </button>
                        <!-- Add buttons for edit, details, priority indicators etc. -->
                    `;
                    taskListElement.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error rendering tasks:', error);
                taskListElement.innerHTML = '<li class="error-state">Could not load tasks.</li>';
            });
    }

    function applyTheme(themeName) {
         document.body.className = themeName === 'dark' ? 'dark-theme' : '';
         // Update meta theme-color (optional)
         const themeColor = themeName === 'dark' ? '#1e1e1e' : '#ffffff'; // Example colors
         document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
         localStorage.setItem('theme', themeName); // Save preference
         console.log(`Theme applied: ${themeName}`);
    }

    function openModal(modalElement) {
        // Logic to display a modal (e.g., add 'active' class, set `hidden=false`)
        modalElement.hidden = false;
         // Trap focus within modal for accessibility?
    }

    function closeModal(modalElement) {
        modalElement.hidden = true;
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

     // Helper to format dates (use a library like date-fns for robust formatting)
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
             // Very basic format, customize as needed
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch (e) {
            return 'Invalid Date';
        }
    }


    // Expose necessary functions
    return {
        renderTasks,
        applyTheme,
        openModal,
        closeModal,
        // Add functions to render projects, update settings UI etc.
    };
})();
