// js/db.js - Basic IndexedDB setup (consider using a library like 'idb' for cleaner syntax)
const Db = (() => {
    let db;
    const DB_NAME = 'CosyTasksDB';
    const DB_VERSION = 1; // Increment this when changing schema
    const TASK_STORE_NAME = 'tasks';
    const PROJECT_STORE_NAME = 'projects'; // Example for projects

    function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject('Error opening database');
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('Database opened successfully');
                resolve();
            };

            // This event only runs if the version changes (or first time)
            request.onupgradeneeded = (event) => {
                db = event.target.result;
                console.log('Upgrading database...');

                // Create Tasks object store
                if (!db.objectStoreNames.contains(TASK_STORE_NAME)) {
                    const taskStore = db.createObjectStore(TASK_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    // Create indexes for sorting/filtering
                    taskStore.createIndex('title', 'title', { unique: false });
                    taskStore.createIndex('completed', 'completed', { unique: false });
                    taskStore.createIndex('dueDate', 'dueDate', { unique: false });
                    taskStore.createIndex('projectId', 'projectId', { unique: false }); // If using projects
                    taskStore.createIndex('priority', 'priority', { unique: false });
                     console.log(`Object store '${TASK_STORE_NAME}' created.`);
                }

                // Create Projects object store (Example)
                 if (!db.objectStoreNames.contains(PROJECT_STORE_NAME)) {
                    const projectStore = db.createObjectStore(PROJECT_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    projectStore.createIndex('name', 'name', { unique: true });
                     console.log(`Object store '${PROJECT_STORE_NAME}' created.`);
                 }

                // Handle future schema upgrades here based on DB_VERSION
                 // if (event.oldVersion < 2) { /* upgrade to v2 */ }
                 // if (event.oldVersion < 3) { /* upgrade to v3 */ }
            };
        });
    }

    // --- CRUD Operations for Tasks ---

    function addTask(taskData) {
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not initialized');
            const transaction = db.transaction([TASK_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(TASK_STORE_NAME);

            // Add default values
            const newTask = {
                ...taskData,
                createdAt: new Date(),
                completed: false,
                // Add other defaults like priority, projectId etc.
            };

            const request = store.add(newTask);

            request.onsuccess = (event) => resolve(event.target.result); // Returns the new ID
            request.onerror = (event) => reject('Error adding task: ' + event.target.error);
        });
    }

    function getTasks(filter = 'all', sort = 'createdAt', projectId = null) {
        // More complex: Implement filtering (all, active, completed)
        // and sorting (dueDate, priority etc.) using indexes
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not initialized');
            const transaction = db.transaction([TASK_STORE_NAME], 'readonly');
            const store = transaction.objectStore(TASK_STORE_NAME);
            const request = store.getAll(); // Simple getAll for now

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject('Error getting tasks: ' + event.target.error);

            // TODO: Implement actual filtering and sorting logic using indexes
            // e.g., using store.index('completed').getAll(false) for active tasks
        });
    }

     function updateTask(taskId, updateData) {
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not initialized');
            const transaction = db.transaction([TASK_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(TASK_STORE_NAME);
            const getRequest = store.get(taskId);

            getRequest.onsuccess = (event) => {
                const task = event.target.result;
                if (task) {
                    // Update fields
                    Object.assign(task, updateData);
                    const updateRequest = store.put(task);
                    updateRequest.onsuccess = resolve;
                    updateRequest.onerror = (event) => reject('Error updating task: ' + event.target.error);
                } else {
                    reject('Task not found');
                }
            };
            getRequest.onerror = (event) => reject('Error finding task to update: ' + event.target.error);
        });
    }

     function deleteTask(taskId) {
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not initialized');
            const transaction = db.transaction([TASK_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(TASK_STORE_NAME);
            const request = store.delete(taskId);

            request.onsuccess = resolve;
            request.onerror = (event) => reject('Error deleting task: ' + event.target.error);
        });
    }

    // Add functions for Projects CRUD, Data Export/Import etc.

    return {
        init,
        addTask,
        getTasks,
        updateTask,
        deleteTask,
        // Export other functions as needed
    };
})();
