// js/components/TaskItem.js
import { updateTask, deleteTask } from '../data.js';
import { sendNotification } from '../lib/notifications.js'
import { getTasks } from '../data.js';
import { renderTaskList } from './TaskList.js';

export function renderTaskItem(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    taskItem.dataset.taskId = task.id; // Store the task ID

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async () => {
        const updatedTask = { ...task, completed: checkbox.checked };
        await updateTask(task.id, updatedTask);

        //Example of notification
        if(checkbox.checked){
          sendNotification('Task Completed',
          `You finished "${task.title}"!`,
          task
        );
        }
    });

    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    titleSpan.style.textDecoration = task.completed ? 'line-through' : 'none';

      const dueDateSpan = document.createElement('span');
    dueDateSpan.classList.add('due-date');
    dueDateSpan.textContent = task.dueDate ? new Date(task.dueDate).toLocaleString() : '';

     const colorTagSpan = document.createElement('span');
    colorTagSpan.classList.add('color-tag', task.color); // Add color class
    colorTagSpan.style.backgroundColor = task.color;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️'; // Using an emoji for fun!
    deleteButton.addEventListener('click', async (event) => {
        event.stopPropagation(); //prevent task item click
        await deleteTask(task.id);
        const taskListContainer = document.getElementById('task-list');
        const tasks = await getTasks()
        renderTaskList(tasks, taskListContainer);
    });

      const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('task-actions');
    actionsContainer.appendChild(deleteButton);

    taskItem.appendChild(checkbox);
    taskItem.appendChild(titleSpan);
    taskItem.appendChild(dueDateSpan);
    taskItem.appendChild(colorTagSpan)
    taskItem.appendChild(actionsContainer);

     taskItem.addEventListener('click', () => {
       //Example of haptic feedback
       if ('vibrate' in navigator) {
        navigator.vibrate(50); // Vibrate for 50ms
      }
    });

    return taskItem;
}
