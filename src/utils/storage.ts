import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, User, Comment, Attachment } from '../types';
import { STORAGE_KEYS, MOCK_USERS } from './constants';

interface BugTrackerDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-status': string; 'by-priority': string; 'by-assignee': string };
  };
  users: {
    key: string;
    value: User;
  };
  comments: {
    key: string;
    value: Comment;
    indexes: { 'by-task': string };
  };
  attachments: {
    key: string;
    value: Attachment;
    indexes: { 'by-task': string };
  };
}

class StorageService {
  private db: IDBPDatabase<BugTrackerDB> | null = null;
  private readonly DB_NAME = 'bugtracker-db';
  private readonly DB_VERSION = 1;

  async init() {
    if (this.db) return;

    this.db = await openDB<BugTrackerDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-status', 'status');
          taskStore.createIndex('by-priority', 'priority');
          taskStore.createIndex('by-assignee', 'assigneeId');
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        // Comments store
        if (!db.objectStoreNames.contains('comments')) {
          const commentStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentStore.createIndex('by-task', 'taskId');
        }

        // Attachments store
        if (!db.objectStoreNames.contains('attachments')) {
          const attachmentStore = db.createObjectStore('attachments', { keyPath: 'id' });
          attachmentStore.createIndex('by-task', 'taskId');
        }
      },
    });

    // Инициализируем только пользователей, но без задач
    await this.initializeUsers();
  }

  private async initializeUsers() {
    const users = await this.getUsers();
    if (users.length === 0) {
      await this.saveUsers(MOCK_USERS);
    }
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    await this.init();
    return this.db!.getAll('tasks');
  }

  async getTask(id: string): Promise<Task | undefined> {
    await this.init();
    return this.db!.get('tasks', id);
  }

  async saveTask(task: Task): Promise<void> {
    await this.init();
    await this.db!.put('tasks', task);
    this.syncToLocalStorage();
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('tasks', 'readwrite');
    await Promise.all(tasks.map(task => tx.store.put(task)));
    await tx.done;
    this.syncToLocalStorage();
  }

  async deleteTask(id: string): Promise<void> {
    await this.init();
    await this.db!.delete('tasks', id);
    this.syncToLocalStorage();
  }

  // Users
  async getUsers(): Promise<User[]> {
    await this.init();
    return this.db!.getAll('users');
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.init();
    return this.db!.get('users', id);
  }

  async saveUsers(users: User[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('users', 'readwrite');
    await Promise.all(users.map(user => tx.store.put(user)));
    await tx.done;
  }

  // Comments
  async getComments(taskId: string): Promise<Comment[]> {
    await this.init();
    const index = this.db!.transaction('comments').store.index('by-task');
    return index.getAll(taskId);
  }

  async saveComment(comment: Comment): Promise<void> {
    await this.init();
    await this.db!.put('comments', comment);
  }

  // Sync with localStorage for backup
  private syncToLocalStorage() {
    this.db!.getAll('tasks').then(tasks => {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    });
  }

  // Очистка всех задач
  async clearAllTasks(): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('tasks', 'readwrite');
    await tx.store.clear();
    await tx.done;
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  }
}

export const storage = new StorageService();