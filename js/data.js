import { openDB } from './lib/idb.js'; // Use a library or write your own wrapper

const DB_NAME = 'cosy-tasks-db';
const STORE_NAME = 'tasks';

async function getDB() {
  if(window.db) return window.db
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              const taskStore =  db.createObjectStore(STORE_NAME, { keyPath: 'id' });
              taskStore.createIndex('dueDate', 'dueDate'); // Example index
              taskStore.createIndex('completed', 'completed')
            }
        },
    });
  window.db = db;
    return db;
}

export async function getTasks() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
}

export async function addTask(task) {
    const db = await getDB();
    return db.add(STORE_NAME, task);
}

export async function updateTask(id, updatedTask) {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existingTask = await store.get(id);
     if (!existingTask) {
        console.warn(`Task with ID ${id} not found.`);
        return; // Or throw an error, depending on your needs
    }
    const finalTask = {...existingTask, ...updatedTask}
    await store.put(finalTask);
    await tx.done;
  return finalTask;
}

export async function deleteTask(id) {
     const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existingTask = await store.get(id);
     if (!existingTask) {
        console.warn(`Task with ID ${id} not found.`);
        return; // Or throw an error, depending on your needs
    }
    await store.delete(id);
    await tx.done;
}
