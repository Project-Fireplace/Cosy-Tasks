// script.js

// --- DOM Element Variables ---
const menuToggle = document.getElementById('menu-toggle');
const settingsToggle = document.getElementById('settings-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const taskList = document.getElementById('task-list');
const taskDetails = document.getElementById('task-details');
const taskDetailsTitle = document.getElementById('task-details-title');
const taskDetailsContent = document.getElementById('task-details-content');
const addTaskOverlay = document.getElementById('add-task-overlay');
const newTaskTitleInput = document.getElementById('new-task-title');
const newTaskDescriptionInput = document.getElementById('new-task-description');
const colorTagSelect = document.getElementById('color-tag-select'); // Get the select element
const editTaskOverlay = document.getElementById('edit-task-overlay');
const editTaskTitleInput = document.getElementById('edit-task-title');
const editTaskDescriptionInput = document.getElementById('edit-task-description');
const editColorTagSelect = document.getElementById('edit-color-tag-select');
const settingsOverlay = document.getElementById('settings-overlay');
const themeSelect = document.getElementById('theme-select');
const rtlToggle = document.getElementById('rtl-toggle');
const fontSelect = document.getElementById('font-select');
const compactModeToggle = document.getElementById('compact-mode-toggle');
const hapticFeedbackToggle = document.getElementById('haptic-feedback-toggle');

// --- State Variables ---
let tasks = []; // Array to store task objects
let currentlyEditingTaskId = null; // Track which task is being edited

// --- Functions ---

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}
// --- Local Storage Functions ---
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        displayTasks();
    }else{
        // Seed with example data if local storage is empty
        tasks = [
            { id: generateId(), title: "Example Task 1", description: "This is a sample task.", dueDate: "2024-03-25", colorTag: "red", completed: false },
            { id: generateId(), title: "Another Task", description: "Learn more about PWAs.", dueDate: "2024-03-22", colorTag: "blue", completed: true },
            { id: generateId(), title: "Complete Project", description: "Finish the Cosy Tasks app.", dueDate: "2024-03-19", colorTag: "green", completed: false}
        ];
        saveTasks();
        displayTasks();
    }
}

// --- Settings Functions ---
function saveSettings() {
    const settings = {
        theme: themeSelect.value,
        rtl: rtlToggle.checked,
        font: fontSelect.value,
        compactMode: compactModeToggle.checked,
		hapticFeedback: hapticFeedbackToggle.checked
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings(settings); // Apply immediately
}

function loadSettings() {
    const storedSettings = localStorage.getItem('settings');
    let settings = { // Default values
			theme: 'fireplace', // Default theme
			rtl: false,
			font: 'Roboto',
			compactMode: false,
			hapticFeedback: true
		};
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
        // Set UI elements to reflect loaded settings
		themeSelect.value = settings.theme;
		rtlToggle.checked = settings.rtl;
		fontSelect.value = settings.font;
		compactModeToggle.checked = settings.compactMode;
		hapticFeedbackToggle.checked = settings.hapticFeedback
    }

    applySettings(settings);
}

function applySettings(settings) {
    // Apply Theme
    document.body.classList.remove('light-theme', 'dark-theme', 'fireplace-theme');
    document.body.classList.add(`${settings.theme}-theme`);

    // Apply RTL
    document.documentElement.dir = settings.rtl ? 'rtl' : 'ltr';

	//Apply font
	document.body.classList.remove('font-roboto', 'font-open-sans'); // Remove other fonts
	document.body.classList.add(`font-${settings.font.toLowerCase().replace(/\s/g, '-')}`);

    // Apply Compact Mode
    document.body.classList.toggle('compact-mode', settings.compactMode);
}


// --- Task Display Functions ---

function displayTasks(filteredTasks = tasks) { // Accept filtered tasks
    taskList.innerHTML = ''; // Clear existing tasks

    filteredTasks.forEach(task => { // Use filteredTasks
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item', 'fade-in'); // Add fade-in class
		taskItem.dataset.taskId = task.id; // Store the task's ID *Corrected*
        taskItem.dataset.colorTag = task.colorTag; // Set the data-color-tag attribute

        taskItem.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
			<p>Due Date: ${task.dueDate}</p>
			<button class="complete-button" data-task-id="${task.id}">${task.completed? "Undo" : "Complete"}</button>
            <!-- Other task details here -->
        `;
         // Add event listener for complete button *IMPROVED*
		const completeButton = taskItem.querySelector('.complete-button');
		completeButton.addEventListener('click', (event) => {
			event.stopPropagation(); // Prevent the task card click
			toggleTaskCompletion(task.id); // Pass the task ID
		});
        taskList.appendChild(taskItem);
    });

	attachTaskCardListeners(); // Attach listeners *after* adding to DOM
}

function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        taskDetailsTitle.textContent = task.title;
        taskDetailsContent.innerHTML = `
            <p>${task.description}</p>
            <p>Due Date: ${task.dueDate}</p>
            <p>Color Tag: ${task.colorTag}</p>
			<p>Completed: ${task.completed? "Yes" : "No"}</p>
            <!-- Add other task details here -->
        `;
        taskDetails.classList.remove('hidden'); // Show details
        taskList.classList.add('hidden'); // Hide list
    }
}
function closeTaskDetails(){
	taskDetails.classList.add('hidden');
	taskList.classList.remove('hidden');
}

// --- Task Manipulation Functions ---
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9); // Generate a simple unique ID
}
function openAddTaskOverlay() {
    addTaskOverlay.classList.remove('hidden');
	addTaskOverlay.classList.add('visible');
}
function closeAddTaskOverlay() {
    addTaskOverlay.classList.add('hidden');
	addTaskOverlay.classList.remove('visible');
    // Clear input fields
    newTaskTitleInput.value = '';
    newTaskDescriptionInput.value = '';
	colorTagSelect.value = 'none';
}
function openEditTaskOverlay(taskId){
	const task = tasks.find(t => t.id === taskId);
	if(!task) return; // Exit if task not found

	currentlyEditingTaskId = taskId;

	editTaskTitleInput.value = task.title;
	editTaskDescriptionInput.value = task.description;
	editColorTagSelect.value = task.colorTag;

	editTaskOverlay.classList.remove('hidden');
	editTaskOverlay.classList.add('visible');
}
function closeEditTaskOverlay(){
	editTaskOverlay.classList.add('hidden');
	editTaskOverlay.classList.remove('visible');
	currentlyEditingTaskId = null; // Reset
}

function addNewTask() {
    const title = newTaskTitleInput.value.trim();
    const description = newTaskDescriptionInput.value.trim();
	const colorTag = colorTagSelect.value;

    if (!title) { // Basic validation
        alert('Please enter a task title.');
        return;
    }

    const newTask = {
        id: generateId(), // Generate a unique ID
        title,
        description,
		dueDate: new Date().toISOString().split('T')[0], //today by default
		colorTag,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    displayTasks();
    closeAddTaskOverlay();

	showNotification(`New Task Added: ${newTask.title}`, {
        body: newTask.description,
        icon: 'images/icon-96x96.png',
        tag: 'new-task',  //  use a tag to prevent duplicate notifications
		data: { taskId: newTask.id }, // Include the task ID
		actions: [ // Now the service worker can use these actions
			{ action: 'complete', title: '✅ Complete' },
			{ action: 'snooze', title: '⏰ Snooze' },
            { action: 'edit', title: '✏️ Edit' }
		]
    });
	hapticFeedback();
}
function editTask() {
    if (!currentlyEditingTaskId) return;

    const task = tasks.find(t => t.id === currentlyEditingTaskId);
    if (!task) return;  // Should not happen, but check anyway

    const newTitle = editTaskTitleInput.value.trim();
    const newDescription = editTaskDescriptionInput.value.trim();
	const newColorTag = editColorTagSelect.value;

    if (!newTitle) {
        alert('Please enter a task title.');
        return;
    }

    task.title = newTitle;
    task.description = newDescription;
	task.colorTag = newColorTag;

    saveTasks();
    displayTasks();
    closeEditTaskOverlay();
	hapticFeedback();
}

function deleteTask(taskId) {

    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    displayTasks();
    closeTaskDetails();
	hapticFeedback();
}

function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed; // Toggle completion status
        saveTasks();
        displayTasks(); // Update the display
		hapticFeedback();
    }
}

// --- UI Interaction Functions ---

function toggleSidebar() {
    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('sidebar-open');
}

function openSettingsOverlay() {
    settingsOverlay.classList.remove('hidden');
	settingsOverlay.classList.add('visible');
}

function closeSettingsOverlay() {
	settingsOverlay.classList.add('hidden');
	settingsOverlay.classList.remove('visible');
}
// --- Filtering ---
function filterTasks(filterType) {
    let filteredTasks = [];

    switch (filterType) {
        case 'all':
            filteredTasks = tasks;
            break;
        case 'today':
            const today = new Date();
            filteredTasks = tasks.filter(task => {
                const dueDate = new Date(task.dueDate);
                return dueDate.toDateString() === today.toDateString();
            });
            break;
        case 'upcoming':
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1); // Start from tomorrow

            filteredTasks = tasks.filter(task => {
                const dueDate = new Date(task.dueDate);
				return dueDate >= tomorrow;
            });
            break;
        // Add more cases for other filters (priority, location, etc.)
		default:
			filteredTasks = tasks; // Default to all
    }

    displayTasks(filteredTasks); // Pass the filtered tasks to displayTasks
}

// --- Notifications ---
function showNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.getRegistration().then(registration => { // Use getRegistration
            if (registration) {
                registration.showNotification(title, options);
            } else {
                console.error('No service worker registration found.');
            }
        });
    }
	else {
		 // Notifications not supported or not granted
        console.log("Notifications are not supported");
	}
}
// --- Haptic Feedback ---
function hapticFeedback() {
	// Check for haptic feedback support and setting
    if ('vibrate' in navigator && hapticFeedbackToggle.checked) {
        navigator.vibrate(50); // Vibrate for 50ms (adjust as needed)
    }
}
// --- Event Listeners ---

// --- Task Card Click (Show Details) ---
function attachTaskCardListeners() {
    const taskCards = document.querySelectorAll('.task-item'); // Corrected selector
    taskCards.forEach(card => {
        card.addEventListener('click', () => {
            const taskId = card.dataset.taskId; // Corrected
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
