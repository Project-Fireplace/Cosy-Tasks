// --- Event Listeners ---

// --- Task Card Click (Show Details) ---
function attachTaskCardListeners() {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        card.addEventListener('click', () => {
            const taskId = card.dataset.taskId;
            showTaskDetails(taskId);
        });
    });
}

// --- Add Task Button ---
document.getElementById('add-task').addEventListener('click', openAddTaskOverlay);

// --- Save New Task Button ---
document.getElementById('save-new-task').addEventListener('click', addNewTask);

// --- Cancel Add Task Button ---
document.getElementById('cancel-add-task').addEventListener('click', closeAddTaskOverlay);

//---Edit Task Button (from details view)---
document.getElementById('edit-task').addEventListener('click', () => {
	const taskId = tasks.find(t => t.title === taskDetailsTitle.textContent)?.id; // Get ID from displayed task
    if (taskId) {
        closeTaskDetails(); // Close details *before* opening edit
        openEditTaskOverlay(taskId);
    }
});

// --- Save Edited Task Button ---
document.getElementById('save-edited-task').addEventListener('click', editTask);

// --- Cancel Edit Task Button ---
document.getElementById('cancel-edit-task').addEventListener('click', closeEditTaskOverlay);

// --- Delete Task Button (from details view) ---
document.getElementById('delete-task').addEventListener('click', () => {
    const taskId = tasks.find(t => t.title === taskDetailsTitle.textContent)?.id; // Get ID from displayed task.  Better than using a global.
    if (taskId) {
        deleteTask(taskId);
    }
});

//---Close Task Details
document.getElementById('close-details').addEventListener('click', closeTaskDetails);

// --- Menu Toggle ---
menuToggle.addEventListener('click', toggleSidebar);

// --- Settings Toggle ---
settingsToggle.addEventListener('click', openSettingsOverlay);

// --- Save Settings Button ---
document.getElementById('save-settings').addEventListener('click', saveSettings);

//---Close Settings Button---
document.getElementById('close-settings').addEventListener('click', closeSettingsOverlay);

// --- Sidebar Navigation Clicks (Filtering) ---
document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        const filterType = link.dataset.filter;
		//remove .active from all filter links
		document.querySelectorAll('.sidebar nav a').forEach(el => el.classList.remove('active'));
		//add it to current
		link.classList.add('active');
        filterTasks(filterType);
		// Close sidebar on mobile after selecting a filter
        if (window.innerWidth <= 768) {
            toggleSidebar(); // Close the sidebar
        }
    });
});

// --- Initial Load ---
loadTasks();
loadSettings();

// --- Request Notification Permission (on user interaction)---
document.body.addEventListener('click', () => { // Best practice: Request on user gesture
	if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
		Notification.requestPermission().then(permission => {
			if (permission === 'granted') {
				console.log('Notification permission granted.');
				//You can show a test notification here, but it is not required
			}
		});
	}
}, {once: true}); // Use 'once' to only request once


// --- Listen for notification close events ---
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'notificationclose') {
        console.log('Notification closed:', event.data);
		// Handle notification close (e.g., update UI)
		const notificationData = event.data.notification.data;
        // Example: If you have a primary key in your data
        if (notificationData && notificationData.primaryKey) {
            // Find the task associated with this notification (if needed)
        }
    }
});

// --- Listen for notification click events (including actions) ---
navigator.serviceWorker.addEventListener('message', event => {
	if (event.data.type === 'notificationclick') {
		console.log('Notification clicked:', event.data);

		const notification = event.data.notification;
		const action = event.data.action;
        const taskId = notification.data.taskId; //  pass the task ID in the notification data


		if (action === 'complete') {
            // Find and update the task (mark as complete)
            const taskIndex = tasks.findIndex(t => t.id === taskId); //find by id
            if(taskIndex > -1){
                tasks[taskIndex].completed = true;
                saveTasks();
                displayTasks();
            }


        } else if (action === 'snooze') {
			// Implement snooze logic (e.g., add 15 minutes to the due date)
            const taskIndex = tasks.findIndex(t => t.id === taskId); //find by id
            if(taskIndex > -1){
                const task = tasks[taskIndex];
                // Convert the existing due date string to a Date object (if it exists)
                let dueDate = task.dueDate ? new Date(task.dueDate) : new Date();

                dueDate.setMinutes(dueDate.getMinutes() + 15); //Snooze
                task.dueDate = dueDate.toISOString().split('T')[0]; //back to string
                saveTasks();
                displayTasks(); // Update the task list
            }

        } else if(action === 'edit'){
            // Open edit overlay with task loaded
           const task = tasks.find(t => t.id === taskId); //find by id
           if(task){
            //clients.openWindow() would open a new tab, which isn't quite desired here
               currentlyEditingTaskId = taskId;

				editTaskTitleInput.value = task.title;
				editTaskDescriptionInput.value = task.description;
				editColorTagSelect.value = task.colorTag;

				editTaskOverlay.classList.remove('hidden');
           }
        }
		else {
			// Default click action (e.g., open the app and show task details)
           // clients.openWindow('/'); //focus is better than openWindow
           clients.matchAll({
               type: "window", includeUncontrolled: true
           }).then(function(clientList) {
               // Check if there's already a window/tab open
               var client = clientList.find(c => c.visibilityState === 'visible'); //find visible
               if(client) {
                   client.focus(); // Focus the existing window
                   //showTaskDetails(taskId); // You may need to pass task ID to showTaskDetails
               } else {
                   // Open a new window/tab if none is open.
                   if(clients.openWindow) return clients.openWindow('/');
               }
           });

			if(taskId){ // Show details *after* ensuring the app is open/focused
				const task = tasks.find(t => t.id === taskId);
				if(task){
					showTaskDetails(taskId);
				}
			}
		}

		notification.close(); // Close the notification after handling the action
	}
});
