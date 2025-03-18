// js/components/TaskList.js
import { renderTaskItem } from './TaskItem.js';

export function renderTaskList(tasks, container) {
    container.innerHTML = ''; // Clear existing tasks

    if (tasks.length === 0) {
        container.innerHTML = '<p>No tasks yet! Add some to get started.</p>';
        return;
    }

    const fragment = document.createDocumentFragment(); // Use a fragment for efficiency
    tasks.forEach(task => {
        const taskItemElement = renderTaskItem(task);
        fragment.appendChild(taskItemElement);
    });
    container.appendChild(fragment);
}
