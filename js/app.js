import { getTasks, addTask, updateTask,deleteTask } from './data.js';
import { renderTaskList } from './components/TaskList.js';
import { loadSettings } from './settings.js';
// Initialize settings
loadSettings();


document.addEventListener('DOMContentLoaded', async () => {
  const taskTitleInput = document.getElementById('task-title');
    const taskDueDateInput = document.getElementById('task-due-date');
    const saveTaskButton = document.getElementById('save-task-button');
    const taskListContainer = document.getElementById('task-list');
    const addTaskButton = document.getElementById('add-task');

    // Load tasks and render
    let tasks = await getTasks();
    renderTaskList(tasks, taskListContainer);

    // Save task handler
   const handleSaveTask = async () => {
        const title = taskTitleInput.value.trim();
        const dueDate = taskDueDateInput.value;
       const colorTag = document.querySelector('.color-tag-selector .tag.selected')?.classList[1]; // Get selected tag
        if (title) {
            const newTask = {
                id: Date.now(), // Simple ID for now
                title,
                dueDate,
                completed: false,
              color: colorTag,
            };
            await addTask(newTask);
            tasks = await getTasks(); // Reload tasks
            renderTaskList(tasks, taskListContainer);
            taskTitleInput.value = ''; // Clear input
            taskDueDateInput.value = '';
            // Clear selected tag
            document.querySelectorAll('.color-tag-selector .tag').forEach(tag => tag.classList.remove('selected'));


        }
    };

    saveTaskButton.addEventListener('click', handleSaveTask);
  addTaskButton.addEventListener('click', handleSaveTask)
    taskTitleInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleSaveTask();
        }
    });

  // Color tag selection
    document.querySelectorAll('.color-tag-selector .tag').forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove 'selected' class from all tags
            document.querySelectorAll('.color-tag-selector .tag').forEach(t => t.classList.remove('selected'));
            // Add 'selected' class to the clicked tag
            this.classList.add('selected');
        });
    });


  // Listen for messages from the service worker
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'TASK_COMPLETED') {
       handleTaskCompleted(event.data.taskId)
    } else if (event.data.type === 'TASK_SNOOZED') {
      handleTaskSnoozed(event.data.taskId);
    }
  });

  async function handleTaskCompleted (taskId){
      try{
          const task = tasks.find((t) => t.id == taskId)
          if (!task) {
            console.warn(`Task with ID ${taskId} not found.`);
            return;
          }
          const updatedTask = {...task, completed: true}
          await updateTask(taskId, updatedTask)
          tasks = await getTasks(); // Reload tasks
          renderTaskList(tasks, taskListContainer);
      }
      catch(e){
        console.error('Failed to complete task', e)
      }
  }

  async function handleTaskSnoozed(taskId){
     try{
          const task = tasks.find((t) => t.id == taskId)
          if (!task) {
            console.warn(`Task with ID ${taskId} not found.`);
            return;
          }
        const now = new Date();
        const snoozeTime = new Date(now.getTime() + 15 * 60000); // +15 minutes

          const updatedTask = {...task, dueDate: snoozeTime.toISOString()};
          await updateTask(taskId, updatedTask);
          tasks = await getTasks(); // Reload tasks
          renderTaskList(tasks, taskListContainer);
      }
      catch(e){
        console.error('Failed to complete task', e)
      }
  }

});
