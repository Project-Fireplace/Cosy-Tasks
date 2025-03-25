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
const newTaskDueDateInput = document.getElementById('new-task-due-date');
const editTaskDueDateInput = document.getElementById('edit-task-due-date');
// New DOM elements
const newTaskDueTimeInput = document.getElementById('new-task-due-time');
const editTaskDueTimeInput = document.getElementById('edit-task-due-time');
const newTaskLocationInput = document.getElementById('new-task-location');
const editTaskLocationInput = document.getElementById('edit-task-location');
const newTaskPrioritySelect = document.getElementById('new-task-priority');
const editTaskPrioritySelect = document.getElementById('edit-task-priority');
const newTaskRecurrenceSelect = document.getElementById('new-task-recurrence');
const editTaskRecurrenceSelect = document.getElementById('edit-task-recurrence');
const newTaskReminderInput = document.getElementById('new-task-reminder');
const editTaskReminderInput = document.getElementById('edit-task-reminder');
const newTaskNotesTextarea = document.getElementById('new-task-notes');
const editTaskNotesTextarea = document.getElementById('edit-task-notes');
const newTaskSubtasksContainer = document.getElementById('new-task-subtasks-container');
const editTaskSubtasksContainer = document.getElementById('edit-task-subtasks-container');
const addNewSubtaskButton = document.getElementById('add-new-subtask');
const addEditSubtaskButton = document.getElementById('add-edit-subtask');
const newTaskAttachmentsContainer = document.getElementById('new-task-attachments-container');
const editTaskAttachmentsContainer = document.getElementById('edit-task-attachments-container');
const addNewAttachmentButtons = document.querySelectorAll('.add-new-attachment'); // Select *all* add attachment buttons
const addEditAttachmentButtons = document.querySelectorAll('.add-edit-attachment');
const searchInput = document.getElementById('search-input');
const sortButton = document.getElementById('sort-button');
const focusModeToggle = document.getElementById('focus-mode-toggle');
const dndModeToggle = document.getElementById('dnd-mode-toggle');
const archiveTaskButton = document.getElementById('archive-task'); // Archive button
const showSearchCheckbox = document.getElementById('show-search');
const showSortCheckbox = document.getElementById('show-sort');
const showFocusModeCheckbox = document.getElementById('show-focus-mode');
const showDndModeCheckbox = document.getElementById('show-dnd-mode');

// --- State Variables ---
let tasks = []; // Array to store task objects
let currentlyEditingTaskId = null; // Track which task is being edited
let isFocusMode = false;
let isDNDMode = false;
let sortMethod = 'dueDate'; // Default sort method
let archivedTasks = []; // Array to store archived tasks


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
    localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks)); // Save archived tasks
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    const storedArchivedTasks = localStorage.getItem('archivedTasks');

    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }else{
        // Seed with example data if local storage is empty
        tasks = [
            { id: generateId(), title: "Example Task 1", description: "This is a sample task.", dueDate: "2024-03-25", dueTime: "10:30", colorTag: "red", completed: false, priority: "medium", location: "Office", recurrence: "none", reminder: "", notes: "Some notes", subtasks: [{id: generateId(), text: 'Subtask 1', completed: false}], attachments: ['file1.pdf'], pinned: false},
            { id: generateId(), title: "Another Task", description: "Learn more about PWAs.", dueDate: "2024-03-22", dueTime: "14:00", colorTag: "blue", completed: true,  priority: "low", location: "Home", recurrence: "weekly", reminder: "", notes: "", subtasks: [], attachments: [], pinned: true},
            { id: generateId(), title: "Complete Project", description: "Finish the Cosy Tasks app.", dueDate: "2024-03-19", dueTime: "17:00", colorTag: "green", completed: false, priority: "high", location: "Remote", recurrence: "none", reminder: "", notes: "Final touches", subtasks: [], attachments: [], pinned: false}
        ];
    }
    if (storedArchivedTasks) {
        archivedTasks = JSON.parse(storedArchivedTasks);
    }
     displayTasks(); // Always display tasks after loading.
}

// --- Settings Functions ---
function saveSettings() {
    const settings = {
        theme: themeSelect.value,
        rtl: rtlToggle.checked,
        font: fontSelect.value,
        compactMode: compactModeToggle.checked,
		hapticFeedback: hapticFeedbackToggle.checked,
        toolbar: { // Store toolbar visibility
            search: showSearchCheckbox.checked,
            sort: showSortCheckbox.checked,
            focusMode: showFocusModeCheckbox.checked,
            dndMode: showDndModeCheckbox.checked,
        }
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings(settings); // Apply immediately
	closeSettingsOverlay(); // Close after saving
}

function loadSettings() {
    const storedSettings = localStorage.getItem('settings');
    let settings = { // Default values
			theme: 'fireplace', // Default theme
			rtl: false,
			font: 'Roboto',
			compactMode: false,
			hapticFeedback: true,
            toolbar: { // Default toolbar visibility
                search: true,
                sort: true,
                focusMode: true,
                dndMode: true,
            }
		};
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
        // Set UI elements to reflect loaded settings
		themeSelect.value = settings.theme;
		rtlToggle.checked = settings.rtl;
		fontSelect.value = settings.font;
		compactModeToggle.checked = settings.compactMode;
		hapticFeedbackToggle.checked = settings.hapticFeedback;
        // Toolbar settings
        showSearchCheckbox.checked = settings.toolbar.search;
        showSortCheckbox.checked = settings.toolbar.sort;
        showFocusModeCheckbox.checked = settings.toolbar.focusMode;
        showDndModeCheckbox.checked = settings.toolbar.dndMode;

    }

    applySettings(settings);
}

function applySettings(settings) {
    // Apply Theme
    document.body.classList.remove(
        'light-theme', 'dark-theme', 'fireplace-theme', 'forest-theme', 'ocean-theme',
        'nightsky-theme', 'desert-theme', 'monochrome-theme', 'pastel-theme',
        'glassmorphism-theme', 'retro-theme', 'minimalist-theme', 'cyberpunk-theme', 'nature-theme' // Add new themes
    );
    document.body.classList.add(`${settings.theme}-theme`);

    // Apply RTL
    document.documentElement.dir = settings.rtl ? 'rtl' : 'ltr';

	//Apply font
	document.body.classList.remove('font-roboto', 'font-open-sans'); // Remove other fonts
	document.body.classList.add(`font-${settings.font.toLowerCase().replace(/\s/g, '-')}`);

    // Apply Compact Mode
    document.body.classList.toggle('compact-mode', settings.compactMode);

    // Apply Toolbar Customization
    searchInput.classList.toggle('hidden-toolbar-element', !settings.toolbar.search);
    sortButton.classList.toggle('hidden-toolbar-element', !settings.toolbar.sort);
    focusModeToggle.classList.toggle('hidden-toolbar-element', !settings.toolbar.focusMode);
    dndModeToggle.classList.toggle('hidden-toolbar-element', !settings.toolbar.dndMode);
}


// --- Task Display Functions ---
function displayTasks(filteredTasks = tasks) {
    taskList.innerHTML = '';

    // Handle pinning *before* sorting
    const pinnedTasks = filteredTasks.filter(task => task.pinned);
    const unpinnedTasks = filteredTasks.filter(task => !task.pinned);

   // Combine pinned and unpinned tasks (pinned first)
   const sortedAndPinnedTasks = [...pinnedTasks, ...sortTasks(unpinnedTasks)];


    sortedAndPinnedTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item', 'fade-in');
        taskItem.dataset.taskId = task.id;
        taskItem.dataset.colorTag = task.colorTag;

        if (task.completed) {
            taskItem.classList.add('completed');
        }

        // Pinned class
        if (task.pinned) {
            taskItem.classList.add('pinned');
        }

        let subtaskHtml = '';
        if(task.subtasks && task.subtasks.length > 0){
            subtaskHtml += '<ul>';
            task.subtasks.forEach(sub => {
                subtaskHtml += `<li class="subtask"><input type="checkbox" data-subtask-id="${sub.id}" ${sub.completed? "checked" : ""} disabled>${sub.text}</li>`
            });
            subtaskHtml += '</ul>'
        }

        let attachmentHtml = '';
        if(task.attachments && task.attachments.length > 0){
           attachmentHtml += 'Attachments: ';
            attachmentHtml += task.attachments.join(', ');
        }

         // Calculate progress for progress bar (if subtasks exist)
        let progressBarHtml = '';
        if (task.subtasks && task.subtasks.length > 0) {
            const completedSubtasks = task.subtasks.filter(sub => sub.completed).length;
            const progressPercentage = (completedSubtasks / task.subtasks.length) * 100;
            progressBarHtml = `<progress value="${progressPercentage}" max="100"></progress>`;
        }


        taskItem.innerHTML = `
            <h3>${task.title}  ${task.pinned ? '<span class="material-symbols-outlined">push_pin</span>' : ''}</h3> 
            <p>${task.description}</p>
            <p>Due Date: ${task.dueDate} ${task.dueTime}</p>
            <p>Priority: ${task.priority}</p>
             ${progressBarHtml} <!-- Progress bar -->
            ${subtaskHtml}
            <p>${attachmentHtml}</p>
            <button class="complete-button" data-task-id="${task.id}">${task.completed ? "Undo" : "Complete"}</button>
             <button class="pin-button" data-task-id="${task.id}">${task.pinned ? "Unpin" : "Pin"}</button>
        `;

        const completeButton = taskItem.querySelector('.complete-button');
		completeButton.addEventListener('click', (event) => {
			event.stopPropagation(); // Prevent the task card click
			toggleTaskCompletion(task.id); // Pass the task ID
		});

        // Pin button event listener *NEW*
        const pinButton = taskItem.querySelector('.pin-button');
        pinButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent task card click
            togglePinTask(task.id);
        });

        taskList.appendChild(taskItem);
    });

    attachTaskCardListeners();
}

function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId) || archivedTasks.find(t => t.id === taskId); // Check archived tasks too
    if (task) {
        taskDetailsTitle.textContent = task.title;
          // Build subtask list HTML
        let subtaskHtml = '';
        if (task.subtasks && task.subtasks.length > 0) {
            subtaskHtml = '<ul>';
            task.subtasks.forEach(subtask => {
                subtaskHtml += `<li>${subtask.text} (Completed: ${subtask.completed ? 'Yes' : 'No'})</li>`;
            });
            subtaskHtml += '</ul>';
        }

        // Build attachments list HTML
        let attachmentsHtml = '';
        if (task.attachments && task.attachments.length > 0) {
            attachmentsHtml = '<ul>';
            task.attachments.forEach(attachment => {
                attachmentsHtml += `<li>${attachment}</li>`;
            });
            attachmentsHtml += '</ul>';
        }

        taskDetailsContent.innerHTML = `
            <p>${task.description}</p>
            <p>Due Date: ${task.dueDate}</p>
            <p>Due Time: ${task.dueTime}</p>
            <p>Location: ${task.location}</p>
            <p>Priority: ${task.priority}</p>
            <p>Recurrence: ${task.recurrence}</p>
            <p>Reminder: ${task.reminder}</p>
            <p>Notes: ${task.notes}</p>
            ${subtaskHtml}
            ${attachmentsHtml}
			<p>Completed: ${task.completed? "Yes" : "No"}</p>
            <!-- Add other task details here -->
        `;

        // Show archive/unarchive button based on task's location
        if (tasks.includes(task)) {
            archiveTaskButton.textContent = 'Archive';
            archiveTaskButton.dataset.action = 'archive'; // Use data-action
        } else {
            archiveTaskButton.textContent = 'Unarchive';
            archiveTaskButton.dataset.action = 'unarchive'; // Use data-action
        }
        archiveTaskButton.dataset.taskId = taskId; // Set the task ID

        taskDetails.classList.remove('hidden');
        taskList.classList.add('hidden');
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
    newTaskDueDateInput.value = ''; // Clear date
    newTaskDueTimeInput.value = '';
    newTaskLocationInput.value = '';
    newTaskPrioritySelect.value = 'low'; // Reset to default
    newTaskRecurrenceSelect.value = 'none';
    newTaskReminderInput.value = '';
    newTaskNotesTextarea.value = '';
     // Clear subtasks
     newTaskSubtasksContainer.innerHTML = '<button type="button" id="add-new-subtask">Add Subtask</button>';
     //Re-add the event listener
     document.getElementById('add-new-subtask').addEventListener('click', addNewSubtask);
    // Clear attachments
    newTaskAttachmentsContainer.innerHTML = '<input type="text" class="new-task-attachment" placeholder="attachment.pdf"><button type="button" class="add-new-attachment">Add Attachment</button>';
    //Re-add the event listeners
    newTaskAttachmentsContainer.querySelector('.add-new-attachment').addEventListener('click', addNewAttachment.bind(null, newTaskAttachmentsContainer, 'new-task-attachment'));

}
function openEditTaskOverlay(taskId){
	const task = tasks.find(t => t.id === taskId);
	if(!task) return; // Exit if task not found

	currentlyEditingTaskId = taskId;

	editTaskTitleInput.value = task.title;
	editTaskDescriptionInput.value = task.description;
	editColorTagSelect.value = task.colorTag;
    editTaskDueDateInput.value = task.dueDate; // Populate date
    editTaskDueTimeInput.value = task.dueTime || '';  // Handle potentially missing values
    editTaskLocationInput.value = task.location || '';
    editTaskPrioritySelect.value = task.priority || 'low'; // Default to low
    editTaskRecurrenceSelect.value = task.recurrence || 'none';
    editTaskReminderInput.value = task.reminder || '';
    editTaskNotesTextarea.value = task.notes || '';

     // --- Populate subtasks ---
     editTaskSubtasksContainer.innerHTML = '<button type="button" id="add-edit-subtask">Add Subtask</button>'; // Clear and add button
      // Re-add the event listener
    document.getElementById('add-edit-subtask').addEventListener('click', addEditSubtask);
    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
             const subtaskInput = document.createElement('input');
            subtaskInput.type = 'text';
            subtaskInput.value = subtask.text;
            subtaskInput.dataset.subtaskId = subtask.id; // Store subtask ID
            subtaskInput.classList.add("edit-subtask-input");
            editTaskSubtasksContainer.appendChild(subtaskInput);
        });
    }
   

    // --- Populate attachments ---
    editTaskAttachmentsContainer.innerHTML = '<input type="text" class="edit-task-attachment" placeholder="attachment.pdf"><button type="button" class="add-edit-attachment">Add Attachment</button>';
     // Re-add the event listener
     addEditAttachmentButtons.forEach(btn => {
        btn.addEventListener('click', () => addNewAttachment(editTaskAttachmentsContainer, "edit-task-attachment"));
    });
    if (task.attachments && task.attachments.length > 0) {
        task.attachments.forEach(attachment => {
            const attachmentInput = document.createElement('input');
            attachmentInput.type = 'text';
            attachmentInput.value = attachment;
            attachmentInput.classList.add('edit-task-attachment'); // Use class for styling
            editTaskAttachmentsContainer.appendChild(attachmentInput);
        });
    }


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
    const dueDate = newTaskDueDateInput.value;
    const dueTime = newTaskDueTimeInput.value;
    const location = newTaskLocationInput.value.trim();
    const priority = newTaskPrioritySelect.value;
    const recurrence = newTaskRecurrenceSelect.value;
    const reminder = newTaskReminderInput.value;
    const notes = newTaskNotesTextarea.value.trim();

      // --- Get subtasks ---
    const subtasks = [];
    const subtaskInputs = newTaskSubtasksContainer.querySelectorAll('input[type="text"]');
    subtaskInputs.forEach(input => {
        if (input.value.trim() !== '') { // Only add non-empty subtasks
        subtasks.push({ id: generateId(), text: input.value.trim(), completed: false });
        }
    });
    
    // --- Get attachments ---
    const attachments = [];
    const attachmentInputs = newTaskAttachmentsContainer.querySelectorAll('.new-task-attachment')
    attachmentInputs.forEach(input => {
        if(input.value.trim() !== ''){
            attachments.push(input.value.trim());
        }
    });

    if (!title || !dueDate) {
        alert('Please enter a task title and due date.');
        return;
    }

    const newTask = {
        id: generateId(),
        title,
        description,
		dueDate,  // Now using the date input value
        dueTime,
        location,
        priority,
        recurrence,
        reminder,
        notes,
        subtasks,       // Add subtasks
        attachments, // Add attachments
		colorTag,
        completed: false,
        pinned: false // Default to unpinned
    };

    tasks.push(newTask);
    saveTasks();
    displayTasks();
    closeAddTaskOverlay();

    //Set reminder if exists and if is not dnd mode
    if(reminder && !isDNDMode){
        scheduleReminder(newTask);
    }

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
    if (!task) return;

    const newTitle = editTaskTitleInput.value.trim();
    const newDescription = editTaskDescriptionInput.value.trim();
	const newColorTag = editColorTagSelect.value;
    const newDueDate = editTaskDueDateInput.value;
    const newDueTime = editTaskDueTimeInput.value;
    const newLocation = editTaskLocationInput.value.trim();
    const newPriority = editTaskPrioritySelect.value;
    const newRecurrence = editTaskRecurrenceSelect.value;
    const newReminder = editTaskReminderInput.value;
    const newNotes = editTaskNotesTextarea.value.trim();

      // --- Get edited subtasks ---
    const newSubtasks = [];
     const subtaskInputs = editTaskSubtasksContainer.querySelectorAll('input[type="text"]');
        subtaskInputs.forEach(input => {
        if (input.value.trim() !== '') { //only non-empty
            //If id exists, it is an existing subtask
            const subtaskId = input.dataset.subtaskId;
            if(subtaskId){
                // Find the existing subtask and update it
                const existingSubtask = task.subtasks.find(sub => sub.id === subtaskId);
                if(existingSubtask){
                    newSubtasks.push({id: existingSubtask.id, text: input.value.trim(), completed: existingSubtask.completed});
                }
            } else {
                //is new
                 newSubtasks.push({ id: generateId(), text: input.value.trim(), completed: false });
            }
        }
    });


    // --- Get edited attachments ---
      const newAttachments = [];
    const attachmentInputs = editTaskAttachmentsContainer.querySelectorAll('.edit-task-attachment'); // Select by class
    attachmentInputs.forEach(input => {
        if (input.value.trim() !== '') {
            newAttachments.push(input.value.trim());
        }
    });


    if (!newTitle || !newDueDate) {
        alert('Please enter a task title and due date.');
        return;
    }

    task.title = newTitle;
    task.description = newDescription;
	task.colorTag = newColorTag;
    task.dueDate = newDueDate;
    task.dueTime = newDueTime;
    task.location = newLocation;
    task.priority = newPriority;
    task.recurrence = newRecurrence;
    task.reminder = newReminder;
    task.notes = newNotes;
    task.subtasks = newSubtasks; // Update subtasks
    task.attachments = newAttachments;

     // Handle reminder changes *NEW*
     //If is not dnd mode
    if (task.reminder !== newReminder && !isDNDMode) {
        if (newReminder) {
            scheduleReminder(task); // Schedule if a new reminder is set
        }
    }

    saveTasks();
    displayTasks();
    closeEditTaskOverlay();
	hapticFeedback();
}

// --- Add Subtask ---
function addNewSubtask() {
    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.placeholder = 'Enter subtask...';
    subtaskInput.classList.add('new-subtask-input'); // Add a class
    newTaskSubtasksContainer.insertBefore(subtaskInput, addNewSubtaskButton); //insert before
}

function addEditSubtask(){
    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.placeholder = 'Enter subtask...';
    subtaskInput.classList.add('edit-subtask-input');
     editTaskSubtasksContainer.insertBefore(subtaskInput, addEditSubtaskButton); //insert before
}

// --- New function: Add New Attachment ---
function addNewAttachment(container, className) { // Pass container and class
    const attachmentInput = document.createElement('input');
    attachmentInput.type = 'text';
    attachmentInput.placeholder = 'attachment.pdf';
    attachmentInput.classList.add(className); // Use the provided class
    // Find the "Add Attachment" button WITHIN the container and insert before it.
    const addButton = container.querySelector('button');
    if (addButton) {
        container.insertBefore(attachmentInput, addButton);
    } else {
        // Fallback: Append if no button is found (shouldn't happen, but good to handle)
        container.appendChild(attachmentInput);
    }
}
function closeSettingsOverlay() {
	settingsOverlay.classList.add('hidden');
	settingsOverlay.classList.remove('visible'); //  ADD THIS
}
// --- Filtering -- (Modified)
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
        case 'archived': //  Handle archived tasks
            filteredTasks = archivedTasks;
            break;
        // Add more cases for other filters (priority, location, etc.)
		case 'profiles': //Just remove the active, do nothing else
            break;
		default:
			filteredTasks = tasks; // Default to all
    }

    displayTasks(filteredTasks); // Pass the filtered tasks to displayTasks
}

// --- Toggle Task Completion ---(Modified)
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
		//Handle Recurrence
		if(task.completed && task.recurrence !== 'none'){
			let newDate = new Date(task.dueDate);
			switch(task.recurrence){
				case 'daily':
					newDate.setDate(newDate.getDate() + 1);
					break;
				case 'weekly':
					newDate.setDate(newDate.getDate() + 7);
					break;
				case 'monthly':
					newDate.setMonth(newDate.getMonth() + 1);
					break;
			}
			task.dueDate = newDate.toISOString().split('T')[0];

			//reset reminder
			if(task.reminder){
				const originalReminder = new Date(task.reminder);
				let newReminder = new Date(newDate); //based on new due date

				newReminder.setHours(originalReminder.getHours());
				newReminder.setMinutes(originalReminder.getMinutes());
				newReminder.setSeconds(originalReminder.getSeconds());

				task.reminder = newReminder.toISOString().substring(0, 16); //format
				scheduleReminder(task);
			}
			//if there are subtasks, reset
			if(task.subtasks && task.subtasks.length > 0){
				task.subtasks.forEach(sub => sub.completed = false);
			}
		}
        saveTasks();
        displayTasks();  //  Call displayTasks to update *everything*
		hapticFeedback();
    }
}

 // --- Toggle Focus Mode ---
function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    document.body.classList.toggle('focus-mode', isFocusMode);
	focusModeToggle.querySelector('span').textContent = isFocusMode? 'visibility' : 'center_focus_strong'; // Update icon
    // If entering focus mode, and a task is selected, show it.
    if (isFocusMode && taskDetailsTitle.textContent) { //Check for selected task
		const taskId = tasks.find(t => t.title === taskDetailsTitle.textContent)?.id;
        showTaskDetails(taskId); // Re-show details (to apply focus mode styles)
    } else {
		closeTaskDetails();
	}
	hapticFeedback();
}

// --- Toggle DND Mode ---
function toggleDNDMode() {
    isDNDMode = !isDNDMode;
    dndModeToggle.querySelector('span').textContent = isDNDMode ? 'do_not_disturb_off' : 'do_not_disturb_on'; //update
	hapticFeedback();
}

 // --- Toggle Pinned Task ---
 function togglePinTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.pinned = !task.pinned; // Toggle the pinned state
        saveTasks();
        displayTasks(); // Re-render the task list
		hapticFeedback();
    }
}

// --- Inside deleteTask() --- (Corrected)
function deleteTask(taskId) {
    //Check if it is in tasks or archived
    const taskInTasks = tasks.find(task => task.id === taskId);
    const taskInArchive = archivedTasks.find(t => t.id ===taskId);

    if(taskInTasks){
        tasks = tasks.filter(task => task.id !== taskId);
    } else if(taskInArchive){
        archivedTasks = archivedTasks.filter(task => task.id !== taskId);
    }

    saveTasks();
    displayTasks();
    closeTaskDetails();
	hapticFeedback();
}

// --- Archive/Unarchive Task ---
function archiveTask(taskId, action) {
      if (action === 'archive') {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const taskToArchive = tasks.splice(taskIndex, 1)[0]; // Remove from tasks
            archivedTasks.push(taskToArchive); // Add to archivedTasks
        }
    } else if (action === 'unarchive') {
         const taskIndex = archivedTasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const taskToUnarchive = archivedTasks.splice(taskIndex, 1)[0]; // Remove from archived
            tasks.push(taskToUnarchive); // Add back to tasks
        }
    }
    saveTasks();
    displayTasks();
    closeTaskDetails();
}

// --- Sort Tasks ---
function sortTasks(taskListToSort) { //sort a list passed as an argument
    switch(sortMethod){
        case 'dueDate':
            return taskListToSort.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
        case 'priority':
            //sort high > medium > low
             return taskListToSort.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        case 'title':
            return taskListToSort.sort((a,b) => a.title.localeCompare(b.title));
        default:
            return taskListToSort;
    }
}

// --- Notifications --- (Corrected)
function showNotification(title, options) {
   if ('Notification' in window && Notification.permission === 'granted' && !isDNDMode) {
        navigator.serviceWorker.ready.then(registration => { // Use .ready
            registration.showNotification(title, options);

        }).catch(error => { // Added error handling
                console.error("Error showing notification via service worker:", error);
        });
    }
	else {
				 // Notifications not supported or not granted, or DND mode
        console.log("Notifications are not supported, not granted, or DND mode is active.");
	}
}

// --- Schedule Reminder --- (Corrected)
function scheduleReminder(task) {
    if (task.reminder && !isDNDMode) {
        const now = new Date();
        const reminderTime = new Date(task.reminder);

        if(reminderTime > now){ //don't shcedule if in the past
            const timeUntilReminder = reminderTime.getTime() - now.getTime();

			setTimeout(() => {
				showNotification(`Reminder: ${task.title}`, {
                    body: task.description,
                    icon: 'images/icon-96x96.png',
                    tag: `reminder-${task.id}`, // Unique tag
                    data: { taskId: task.id }
                });
			}, timeUntilReminder);
        }
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
			// If focus mode is on, *don't* toggle.  Just show.
            if (isFocusMode) {
                showTaskDetails(taskId);
            } else {
                // Original toggle behavior
                if (taskDetails.classList.contains('hidden') || taskDetailsTitle.textContent !== card.querySelector('h3').textContent.replace('📌','').trim()) { //compare
                    showTaskDetails(taskId);
                } else {
                    closeTaskDetails(); //  close if it's already open *and* showing the same task
                }
            }
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
    // Get task ID from the currently displayed task *in the details section*.
    const taskId = tasks.find(t => t.title === taskDetailsTitle.textContent)?.id || archivedTasks.find(t => t.title === taskDetailsTitle.textContent)?.id;
    if (taskId) {
        closeTaskDetails();
        openEditTaskOverlay(taskId);
    }
});

// --- Save Edited Task Button ---
document.getElementById('save-edited-task').addEventListener('click', editTask);

// --- Cancel Edit Task Button ---
document.getElementById('cancel-edit-task').addEventListener('click', closeEditTaskOverlay);

// --- Delete Task Button (from details view) ---
document.getElementById('delete-task').addEventListener('click', () => {
	const taskId = tasks.find(t => t.title === taskDetailsTitle.textContent)?.id || archivedTasks.find(t => t.title === taskDetailsTitle.textContent)?.id;
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
                let dueTime = task.dueTime ? task.dueTime.split(':') : ['09','00']; //default time

				dueDate.setHours(parseInt(dueTime[0], 10));
				dueDate.setMinutes(parseInt(dueTime[1], 10));
                dueDate.setMinutes(dueDate.getMinutes() + 15); //Snooze
                task.dueDate = dueDate.toISOString().split('T')[0]; //back to string
                task.dueTime = `${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}` //add correct format
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
                editTaskDueDateInput.value = task.dueDate;
                editTaskDueTimeInput.value = task.dueTime;
                editTaskLocationInput.value = task.location;
                editTaskPrioritySelect.value = task.priority;
                editTaskRecurrenceSelect.value = task.recurrence;
                editTaskReminderInput.value = task.reminder;
                editTaskNotesTextarea.value = task.notes
                // --- Populate subtasks ---
                editTaskSubtasksContainer.innerHTML = '<button type="button" id="add-edit-subtask">Add Subtask</button>'; // Clear and add button
                // Re-add the event listener
                document.getElementById('add-edit-subtask').addEventListener('click', addEditSubtask);
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        const subtaskInput = document.createElement('input');
                        subtaskInput.type = 'text';
                        subtaskInput.value = subtask.text;
                        subtaskInput.dataset.subtaskId = subtask.id; // Store subtask ID
                        subtaskInput.classList.add("edit-subtask-input");
                        editTaskSubtasksContainer.appendChild(subtaskInput);
                    });
                }


                // --- Populate attachments ---
                editTaskAttachmentsContainer.innerHTML = '<input type="text" class="edit-task-attachment" placeholder="attachment.pdf"><button type="button" class="add-edit-attachment">Add Attachment</button>';
                // Re-add the event listener
                addEditAttachmentButtons.forEach(btn => {
                    btn.addEventListener('click', () => addNewAttachment(editTaskAttachmentsContainer, "edit-task-attachment"));
                });
                if (task.attachments && task.attachments.length > 0) {
                    task.attachments.forEach(attachment => {
                        const attachmentInput = document.createElement('input');
                        attachmentInput.type = 'text';
                        attachmentInput.value = attachment;
                        attachmentInput.classList.add('edit-task-attachment'); // Use class for styling
                        editTaskAttachmentsContainer.appendChild(attachmentInput);
                    });
                }

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

//Event Listeners

// --- Search Input (Added) ---
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
    );
    displayTasks(filteredTasks);
});

// --- Sort Button (Added) ---
sortButton.addEventListener('click', () => {
   // Cycle through sort methods: dueDate -> priority -> title -> dueDate
    if (sortMethod === 'dueDate') {
        sortMethod = 'priority';
    } else if (sortMethod === 'priority') {
        sortMethod = 'title';
    } else {
        sortMethod = 'dueDate';
    }
    displayTasks(); // Re-display with the new sort order
	hapticFeedback();
});

//Focus and DND buttons
focusModeToggle.addEventListener('click', toggleFocusMode);
dndModeToggle.addEventListener('click', toggleDNDMode);

// --- Archive Task Button (Added) ---
archiveTaskButton.addEventListener('click', (event) => {
    const taskId = event.target.dataset.taskId;
    const action = event.target.dataset.action; // 'archive' or 'unarchive'
    if (taskId && action) {
        archiveTask(taskId, action);
    }
});

// --- Toolbar Customization (Added) ---
showSearchCheckbox.addEventListener('change', saveSettings);
showSortCheckbox.addEventListener('change', saveSettings);
showFocusModeCheckbox.addEventListener('change', saveSettings);
showDndModeCheckbox.addEventListener('change', saveSettings);

// --- Add Subtask Button ---
addNewSubtaskButton.addEventListener('click', addNewSubtask);
addEditSubtaskButton.addEventListener('click', addEditSubtask);

// --- Add Attachment Buttons (using event delegation) --- Corrected
newTaskAttachmentsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-new-attachment')) {
        addNewAttachment(newTaskAttachmentsContainer, 'new-task-attachment');
    }
});

editTaskAttachmentsContainer.addEventListener('click', (event) => {
     if (event.target.classList.contains('add-edit-attachment')) {
        addNewAttachment(editTaskAttachmentsContainer, 'edit-task-attachment');
    }
});
