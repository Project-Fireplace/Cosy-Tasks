// --- JavaScript ---

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('Service Worker registered! Scope is: ', registration.scope))
            .catch(error => console.log('Service Worker registration failed: ', error));
    });
}

// --- DOM Element References ---
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const offlineSection = document.getElementById('offline-section');
const contentSection = document.getElementById('content'); // Keep for consistency
const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const mainMenu = document.getElementById('mainMenu');
const moreOptionsBtn = document.getElementById('moreOptionsBtn');
const moreOptionsMenu = document.getElementById('moreOptionsMenu');
const clearAllBtn = document.getElementById('clearAllBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const toggleCompletedBtn = document.getElementById('toggleCompletedBtn');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const recurrenceSelect = document.getElementById('recurrenceSelect'); // Recurrence

// Filter elements
const priorityFilter = document.getElementById('priorityFilter');
const dueDateFilter = document.getElementById('dueDateFilter');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

// Settings
const settingsLink = document.querySelector('.settings-link');
const settingsOptions = document.querySelector('.settings-options');
const notificationToggle = document.getElementById('notificationToggle');
const reminderTimeInput = document.getElementById('reminderTime');
const filterLink = document.querySelector('.filter-link'); // Get filter link
const filterOptions = document.querySelector('.filter-options');

//Theme
const themeLink = document.querySelector('.theme-link');
const themeOptions = document.querySelector('.theme-options');
const themeButtons = document.querySelectorAll('.theme-option');

//Search
const searchInput = document.getElementById('searchInput');


// --- Menu Event Listeners ---
menuBtn.addEventListener('click', () => {
    mainMenu.classList.add('open');
});

closeMenuBtn.addEventListener('click', () => {
    mainMenu.classList.remove('open');
});

moreOptionsBtn.addEventListener('click', () => moreOptionsMenu.classList.toggle('open'));

// Settings Toggle
settingsLink.addEventListener('click', (event) => {
    event.preventDefault();
    settingsOptions.classList.toggle('open');
    mainMenu.classList.remove('open'); // Close the drawer
});

//Filter toggle
filterLink.addEventListener('click', (event) => {
    event.preventDefault();
    filterOptions.classList.toggle('open');
     mainMenu.classList.remove('open');
});

// Theme Toggle
themeLink.addEventListener('click', (event) => {
    event.preventDefault();
    themeOptions.classList.toggle('open');
     mainMenu.classList.remove('open'); // Close the drawer when opening theme options
});

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        setTheme(button.dataset.theme);
         themeOptions.classList.remove('open');
    });
});

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (mainMenu.classList.contains('open') && !mainMenu.contains(event.target) && !menuBtn.contains(event.target)) {
        mainMenu.classList.remove('open');
    }
    if (moreOptionsMenu.classList.contains('open') && !moreOptionsMenu.contains(event.target) && !moreOptionsBtn.contains(event.target)) {
        moreOptionsMenu.classList.remove('open');
    }
    if (settingsOptions.classList.contains('open') && !settingsOptions.contains(event.target) && !settingsLink.contains(event.target)) {
        settingsOptions.classList.remove('open');
    }
    // Close filter if open and click is outside
     if (filterOptions.classList.contains('open') && !filterOptions.contains(event.target) && !filterLink.contains(event.target)) {
         filterOptions.classList.remove('open');
    }
    // Close theme options if open and click is outside
    if (themeOptions.classList.contains('open') && !themeOptions.contains(event.target) && !themeLink.contains(event.target)) {
        themeOptions.classList.remove('open');
    }
});

// --- Load Data (Tasks, Theme, and Settings) ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let showCompleted = true;
let currentTheme = localStorage.getItem('theme') || 'light'; // Default to light
document.body.className = currentTheme; // Apply the theme


let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
let reminderTime = parseInt(localStorage.getItem('reminderTime')) || 30;

// Update the UI to reflect the loaded settings
notificationToggle.checked = notificationsEnabled;
reminderTimeInput.value = reminderTime;


// --- Task Functions ---

function displayTasks() {
    const priority = priorityFilter.value;
    const dueDate = dueDateFilter.value;
    const searchTerm = searchInput.value.toLowerCase(); // Get search term

    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        if (!showCompleted && task.completed) return;
        if (priority !== 'all' && task.priority !== priority) return;
        if (dueDate && task.dueDate !== dueDate) return;

        // Search filtering
        if (searchTerm && !task.text.toLowerCase().includes(searchTerm) &&
            !(task.notes && task.notes.toLowerCase().includes(searchTerm))) { //search in notes
                // Check if any subtask matches the search term
                if (!task.subtasks || !task.subtasks.some(subtask => subtask.text.toLowerCase().includes(searchTerm))) {
                   return; // Skip this task if no match in title, notes, or subtasks
                }
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text ${task.completed ? 'completed' : ''} priority-${task.priority}">
                    ${task.text}
                </span>
                ${task.dueDate ? `<span class="due-date"> (Due: ${task.dueDate})</span>` : ''}
                 ${task.recurrence && task.recurrence !== 'none' ? `<span class="recurrence"> (Repeats ${task.recurrence})</span>` : ''}
                <div class="task-actions">
                    <button class="editBtn" data-index="${index}" aria-label="Edit Task">Edit</button>
                    <button class="deleteBtn" data-index="${index}" aria-label="Delete Task">Delete</button>
                </div>
            </div>
             ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
            <div class="edit-notes-form" style="display: none;">
                <textarea class="edit-notes-textarea" aria-label="Edit task notes">${task.notes || ''}</textarea>
                <div class="edit-notes-buttons">
                    <button class="save-notes-btn" data-index="${index}">Save</button>
                    <button class="cancel-notes-btn" data-index="${index}">Cancel</button>
                </div>
            </div>
            ${task.subtasks ? renderSubtasks(task.subtasks, index) : ''}
            <button class="add-subtask-btn" data-index="${index}">Add Subtask</button>

        `;


        li.addEventListener('click', (event) => {
          const target = event.target;
          if (!target.classList.contains('editBtn') && !target.classList.contains('deleteBtn')&& !target.classList.contains('add-subtask-btn') && !target.classList.contains('subtask-checkbox')&& !target.classList.contains('save-notes-btn') && !target.classList.contains('cancel-notes-btn') ) {
            toggleTaskComplete(index);
          }
        });

        taskList.appendChild(li);

        // Event listeners for *newly created* elements
        li.querySelector('.add-subtask-btn').addEventListener('click', addSubtaskInput);
        li.querySelector('.deleteBtn').addEventListener('click', deleteTask);
        li.querySelector('.editBtn').addEventListener('click', editTask);
         // Add event listeners for notes editing
        li.querySelector('.task-text').addEventListener('dblclick', (event) => { //Added double click
            event.stopPropagation();
            startEditingNotes(index);
        });

        const saveNotesBtn = li.querySelector('.save-notes-btn');
        const cancelNotesBtn = li.querySelector('.cancel-notes-btn');
        if(saveNotesBtn) saveNotesBtn.addEventListener('click', saveNotes);
        if(cancelNotesBtn) cancelNotesBtn.addEventListener('click', cancelNotesEdit);


    });
}

function addTask() {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    const recurrence = recurrenceSelect.value;

    if (taskText !== '') {
        const newTask = {
            text: taskText,
            completed: false,
            priority,
            dueDate,
            recurrence,       // Add recurrence
            subtasks: [],     // Initialize subtasks array
            notes: '',          // Initialize notes
            notificationTimeout: null //Keep previous functionality
        };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        taskInput.value = '';
        prioritySelect.value = 'low';
        dueDateInput.value = '';
        recurrenceSelect.value = 'none'; // Reset recurrence

        if (notificationsEnabled && dueDate) {
            scheduleNotification(newTask);
        }
    }
}


function deleteTask(event) {
     event.stopPropagation();
    const index = parseInt(event.target.dataset.index);
      // Cancel any scheduled notification for this task (if it exists)
    cancelNotification(tasks[index]);
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
}

function toggleTaskComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
}

function editTask(event) {
    event.stopPropagation();
    const index = parseInt(event.target.dataset.index); // Get index as number
    const li = event.target.closest('li'); // Find parent li
    const taskTextSpan = li.querySelector('.task-text');
    const currentText = tasks[index].text;

    taskTextSpan.innerHTML = `<input type="text" class="edit-input" value="${currentText}" aria-label="Edit task text">`;
    const editInput = li.querySelector('.edit-input');
    editInput.focus();

    function saveEdit() {
        const newText = editInput.value.trim();
        if (newText !== '') {
            tasks[index].text = newText;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
        displayTasks(); // Re-render
    }

    editInput.addEventListener('blur', saveEdit);
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

function clearAllTasks() {
     if (confirm("Are you sure you want to clear all tasks?")) {
        tasks = [];
        localStorage.removeItem('tasks');
        displayTasks();
        mainMenu.classList.remove('open'); // Close drawer
    }
}

function importTasks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTasks = JSON.parse(e.target.result);
                    if (Array.isArray(importedTasks) && importedTasks.every(t =>
                        typeof t.text === 'string' &&
                        typeof t.completed === 'boolean' &&
                        typeof t.priority === 'string' &&
                        (t.dueDate === null || typeof t.dueDate === 'string')&&
                        (t.recurrence === undefined || typeof t.recurrence === 'string') && //recurrence
                        (t.subtasks === undefined || Array.isArray(t.subtasks)) && //subtasks
                        (t.notes === undefined || typeof t.notes === 'string') //notes
                    )) {
                        tasks = importedTasks;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                        displayTasks();
                        alert('Tasks imported successfully!');
                    }
                    else {
                        alert('Invalid file format. Please import a valid JSON file with text, completed, priority, dueDate, recurrence, subtasks and notes fields.');
                    }

                } catch (error) {
                    alert('Error importing tasks: ' + error.message);
                }
                 mainMenu.classList.remove('open'); // Close drawer
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function exportTasks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tasks.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    mainMenu.classList.remove('open'); // Close drawer
}

function toggleCompletedTasks() {
    showCompleted = !showCompleted;
    displayTasks();
    toggleCompletedBtn.textContent = showCompleted ? "Hide Completed" : "Show Completed";
    mainMenu.classList.remove('open'); // Close drawer
}

// --- Notification Functions ---

function scheduleNotification(task) {
    if (!('Notification' in window)) {
        console.warn("This browser does not support desktop notification");
        return;
    }

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const reminderTimeMs = reminderTime * 60 * 1000; // Convert minutes to milliseconds
    const notificationTime = new Date(dueDate.getTime() - reminderTimeMs);

    if (notificationTime <= now) {
        console.log("Reminder time is in the past. Not scheduling notification.");
        return; // Don't schedule if it's in the past
    }


    const timeUntilNotification = notificationTime.getTime() - now.getTime();

   const notificationTimeout = setTimeout(() => {
        if(Notification.permission === "granted"){
            showNotification(task);
          }
    }, timeUntilNotification);

    // Store the timeout ID so we can cancel it later if needed
    task.notificationTimeout = notificationTimeout;
}

function showNotification(task) {
    const notification = new Notification(`Task Reminder: ${task.text}`, {
        body: `Your task "${task.text}" is due soon!`,
        icon: 'images/icon-192.png', // Use your app's icon
    });
}

function cancelNotification(task) {
   if (task.notificationTimeout) {
        clearTimeout(task.notificationTimeout);
        delete task.notificationTimeout; // Clean up the property
    }
}
//Request for notifications
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        alert("This browser does not support desktop notification");
        return;
    }

    if(Notification.permission !== "granted" && Notification.permission !== "denied"){
         Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
                notificationsEnabled = true;
                localStorage.setItem('notificationsEnabled', 'true');
                 notificationToggle.checked = true;
                  // Reschedule notifications for existing tasks
                tasks.forEach(task => {
                    if (task.dueDate) {
                        scheduleNotification(task);
                    }
                });

            } else{
                console.log("Notification permission denied.");
                 notificationsEnabled = false;
                localStorage.setItem('notificationsEnabled', 'false');
                notificationToggle.checked = false;
            }
        });
    }
}

// --- Subtask Functions ---
function renderSubtasks(subtasks, taskIndex) {
    if (!subtasks) {
      return ''; // Return an empty string if there are no subtasks.
    }
    let subtaskListItems = subtasks.map((subtask, subtaskIndex) => `
        <li class="subtask ${subtask.completed ? 'completed' : ''}" data-task-index="${taskIndex}" data-subtask-index="${subtaskIndex}">
            <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
            <span>${subtask.text}</span>
             <button class="delete-subtask-btn" data-task-index="${taskIndex}" data-subtask-index="${subtaskIndex}">
                <i class="material-icons">delete</i>
            </button>
        </li>
    `).join('');

    return `<ul class="subtasks">${subtaskListItems}</ul>`;
}

function addSubtaskInput(event) {
    const taskIndex = parseInt(event.target.dataset.index);
    const li = event.target.closest('li'); // Find the closest parent li
    const subtaskInput = document.createElement('input');
    subtaskInput.type = 'text';
    subtaskInput.placeholder = 'Add subtask...';
    subtaskInput.classList.add('subtask-input');
    subtaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSubtask(taskIndex, subtaskInput.value.trim(), li);
        }
    });
    // Insert the input field *before* the "Add Subtask" button
    li.insertBefore(subtaskInput, event.target);
    subtaskInput.focus(); // Focus the new input
}

function addSubtask(taskIndex, subtaskText, li) {
    if (subtaskText !== '') {
        if (!tasks[taskIndex].subtasks) {
            tasks[taskIndex].subtasks = []; // Initialize if it doesn't exist
        }
        tasks[taskIndex].subtasks.push({ text: subtaskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks(); // Re-render to show new subtask
    }
}

function deleteSubtask(event){
    event.stopPropagation();
    const taskIndex = parseInt(event.target.closest('.delete-subtask-btn').dataset.taskIndex);
    const subtaskIndex = parseInt(event.target.closest('.delete-subtask-btn').dataset.subtaskIndex);

    if (!isNaN(taskIndex) && !isNaN(subtaskIndex)) { //  check
        tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks(); // Re-render the task list
    } else {
        console.error("Invalid taskIndex or subtaskIndex for deleteSubtask", taskIndex, subtaskIndex);
    }
}

// --- Task Notes Functions ---
function startEditingNotes(taskIndex) {
    const taskLi = taskList.children[taskIndex];
    if (!taskLi) {
        console.error("Task LI not found for index:", taskIndex);
        return;
    }

     // Hide the existing notes display (if it exists)
    const existingNotes = taskLi.querySelector('.task-notes');
    if (existingNotes) {
        existingNotes.classList.add('editing'); // Add a class to hide it
    }


    const editNotesForm = taskLi.querySelector('.edit-notes-form');
    const textarea = editNotesForm.querySelector('.edit-notes-textarea');
    textarea.value = tasks[taskIndex].notes || ''; // Ensure notes is initialized
    editNotesForm.style.display = 'block'; // Show the form
    textarea.focus();
}

function saveNotes(event) {
     event.stopPropagation();
    const taskIndex = parseInt(event.target.dataset.index);
    const taskLi = taskList.children[taskIndex];
    const textarea = taskLi.querySelector('.edit-notes-textarea');
    const newNotes = textarea.value;

    tasks[taskIndex].notes = newNotes;
    localStorage.setItem('tasks', JSON.stringify(tasks));

      // Show the task-notes div again, update content
    const existingNotes = taskLi.querySelector('.task-notes');
    if (existingNotes) {
      existingNotes.textContent = newNotes;  // Update text content
      existingNotes.classList.remove('editing'); // Remove the hiding class
    } else {
      // If .task-notes doesn't exist (first time adding), create it
      const notesDiv = document.createElement('div');
      notesDiv.classList.add('task-notes');
      notesDiv.textContent = newNotes;

      // Find insertion point: after task-content, before subtasks/edit-form
      let insertionPoint = taskLi.querySelector('.task-content');
      if(insertionPoint){
        insertionPoint.parentNode.insertBefore(notesDiv, insertionPoint.nextSibling); //insert after
      } else {
          taskLi.appendChild(notesDiv); //fallback
      }

    }

    taskLi.querySelector('.edit-notes-form').style.display = 'none'; // Hide form
    displayTasks(); //  re-render (for consistency, though not strictly always needed)
}

function cancelNotesEdit(event) {
    event.stopPropagation();
    const taskIndex = parseInt(event.target.dataset.index);
    const taskLi = taskList.children[taskIndex];
     // Show the task-notes div again (if it exists)
    const existingNotes = taskLi.querySelector('.task-notes');
    if (existingNotes) {
        existingNotes.classList.remove('editing');
    }
    taskLi.querySelector('.edit-notes-form').style.display = 'none'; // Hide form
}
// --- Theme Function ---

function setTheme(themeName) {
    document.body.className = themeName + '-theme'; // Apply the theme class to the body
    localStorage.setItem('theme', themeName);
    currentTheme = themeName; // Update currentTheme
}


// --- Event Listeners (Main) ---
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') { addTask(); } });
clearAllBtn.addEventListener('click', clearAllTasks);
importBtn.addEventListener('click', importTasks);
exportBtn.addEventListener('click', exportTasks);
toggleCompletedBtn.addEventListener('click', toggleCompletedTasks);
applyFiltersBtn.addEventListener('click', displayTasks);
searchInput.addEventListener('input', displayTasks);  // Add search listener

// Settings Listeners
notificationToggle.addEventListener('change', () => {
    notificationsEnabled = notificationToggle.checked;
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    if (notificationsEnabled) {
        requestNotificationPermission(); // Request if enabled
        tasks.forEach(task => {
            if (task.dueDate && !task.completed) {
                scheduleNotification(task);
            }
        });
    } else {
        // Cancel all pending notifications if disabled
        tasks.forEach(task => {
             cancelNotification(task); // Cancel existing
        });
    }
});

reminderTimeInput.addEventListener('change', () => {
    reminderTime = parseInt(reminderTimeInput.value) || 30; // Parse int, default 30
    localStorage.setItem('reminderTime', reminderTime.toString());
    if (notificationsEnabled) {
        // Reschedule all notifications with new time
        tasks.forEach(task => {
           cancelNotification(task); // Cancel existing
            if (task.dueDate) {
                scheduleNotification(task);  // Reschedule
            }
        });
    }
});

taskList.addEventListener('click', (event) => {
    if (event.target.classList.contains('subtask-checkbox')) {
        const taskIndex = parseInt(event.target.closest('.subtask').dataset.taskIndex);
        const subtaskIndex = parseInt(event.target.closest('.subtask').dataset.subtaskIndex);
         toggleSubtaskComplete(taskIndex, subtaskIndex);
    } else if(event.target.classList.contains('delete-subtask-btn')){
        deleteSubtask(event); //call the correct function
    }
});

function toggleSubtaskComplete(taskIndex, subtaskIndex) {
    tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks(); // Re-render
}


// --- Initial Setup ---
displayTasks();
requestNotificationPermission(); // Request permission on load

// --- Offline/Online Detection ---
window.addEventListener('offline', () => { contentSection.style.display = 'none'; offlineSection.style.display = 'block'; console.log('App is offline'); });
window.addEventListener('online', () => { offlineSection.style.display = 'none'; contentSection.style.display = 'block'; console.log("app is online"); });
if (!navigator.onLine) { contentSection.style.display = 'none'; offlineSection.style.display = 'block'; }

// --- Drag and Drop Initialization ---
new Sortable(taskList, {
    animation: 150,
    handle: '.task-text', // Use the task text as the drag handle
    ghostClass: 'sortable-ghost', // Add a class for styling the ghost element
    onEnd: (event) => {
        const itemEl = event.item;  // dragged HTMLElement
        const fromIndex = event.oldIndex;
        const toIndex = event.newIndex;

        // Update the tasks array
        const [task] = tasks.splice(fromIndex, 1); // Remove task from old index
        tasks.splice(toIndex, 0, task); // Insert task at new index

        localStorage.setItem('tasks', JSON.stringify(tasks)); // Save changes
        // displayTasks();  // No need to re-display, SortableJS handles the visual part.
    }
});

// --- Recurring tasks handling (basic) ---
//Note: This function could be way better
function handleRecurringTasks() {
    const now = new Date();
    tasks.forEach(task => {
        if (task.recurrence !== 'none' && task.dueDate && !task.completed) {
            let dueDate = new Date(task.dueDate);

            // Check if the task is overdue and needs to be updated
            while (dueDate < now) {
                switch (task.recurrence) {
                    case 'daily':
                        dueDate.setDate(dueDate.getDate() + 1);
                        break;
                    case 'weekly':
                        dueDate.setDate(dueDate.getDate() + 7);
                        break;
                    case 'monthly':
                        dueDate.setMonth(dueDate.getMonth() + 1);
                        break;
                    case 'yearly':
                        dueDate.setFullYear(dueDate.getFullYear() + 1);
                        break;
                }
            }
             // Update the due date in the task object
             task.dueDate = dueDate.toISOString().split('T')[0];

        }
    });
     localStorage.setItem('tasks', JSON.stringify(tasks)); // Save changes after updating

}

// Call on startup to handle any recurring tasks.
handleRecurringTasks();
// Call it periodically (e.g., every hour) to handle recurring tasks that might have become due.
setInterval(handleRecurringTasks, 60 * 60 * 1000); // Check every hour
