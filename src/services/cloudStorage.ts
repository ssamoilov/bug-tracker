import { Task, User } from '../types';
import { googleDrive } from './googleDrive';
import toast from 'react-hot-toast';

// Локальное хранилище (кэш)
const localCache = {
  tasks: [] as Task[],
  users: [] as User[],
  lastSync: null as string | null,
};

class CloudStorageService {
  private static instance: CloudStorageService;
  private syncInProgress = false;
  private listeners: Array<() => void> = [];

  static getInstance(): CloudStorageService {
    if (!CloudStorageService.instance) {
      CloudStorageService.instance = new CloudStorageService();
    }
    return CloudStorageService.instance;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  async loadTasks(): Promise<Task[]> {
    try {
      if (googleDrive.isAuthenticated()) {
        const cloudData = await googleDrive.loadData();
        if (cloudData && cloudData.tasks.length > 0) {
          localCache.tasks = cloudData.tasks;
          localCache.users = cloudData.users;
          localCache.lastSync = new Date().toISOString();
          this.saveToLocalStorage();
          this.notify();
          return cloudData.tasks;
        }
      }

      const localData = this.loadFromLocalStorage();
      if (localData.tasks.length > 0) {
        localCache.tasks = localData.tasks;
        localCache.users = localData.users;
        return localData.tasks;
      }

      return [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      const localData = this.loadFromLocalStorage();
      return localData.tasks;
    }
  }

  async saveTask(task: Task): Promise<void> {
    try {
      const index = localCache.tasks.findIndex(t => t.id === task.id);
      if (index >= 0) {
        localCache.tasks[index] = task;
      } else {
        localCache.tasks.push(task);
      }

      this.saveToLocalStorage();
      this.notify();

      if (googleDrive.isAuthenticated()) {
        await googleDrive.saveData(localCache.tasks, localCache.users);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      localCache.tasks = tasks;
      this.saveToLocalStorage();
      this.notify();

      if (googleDrive.isAuthenticated()) {
        await googleDrive.saveData(localCache.tasks, localCache.users);
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      localCache.tasks = localCache.tasks.filter(t => t.id !== taskId);
      this.saveToLocalStorage();
      this.notify();

      if (googleDrive.isAuthenticated()) {
        await googleDrive.saveData(localCache.tasks, localCache.users);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    if (localCache.users.length === 0) {
      const localData = this.loadFromLocalStorage();
      localCache.users = localData.users;
    }
    return localCache.users;
  }

  async saveUsers(users: User[]): Promise<void> {
    localCache.users = users;
    this.saveToLocalStorage();
    
    if (googleDrive.isAuthenticated()) {
      await googleDrive.saveData(localCache.tasks, localCache.users);
    }
  }

  async clearAllTasks(): Promise<void> {
    localCache.tasks = [];
    this.saveToLocalStorage();
    this.notify();

    if (googleDrive.isAuthenticated()) {
      await googleDrive.saveData(localCache.tasks, localCache.users);
    }
  }

  async syncWithCloud(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      if (!googleDrive.isAuthenticated()) {
        toast('Войдите в Google Drive для синхронизации', {
          icon: '🔐',
          duration: 3000,
        });
        return;
      }

      const cloudData = await googleDrive.loadData();
      const localTasks = localCache.tasks;

      if (cloudData && cloudData.tasks.length > 0) {
        const cloudLastUpdate = Math.max(...cloudData.tasks.map(t => new Date(t.updatedAt).getTime()));
        const localLastUpdate = localTasks.length > 0 
          ? Math.max(...localTasks.map(t => new Date(t.updatedAt).getTime()))
          : 0;

        if (cloudLastUpdate > localLastUpdate) {
          localCache.tasks = cloudData.tasks;
          localCache.users = cloudData.users;
          this.saveToLocalStorage();
          toast.success(`Загружено ${cloudData.tasks.length} задач из Google Drive`);
        } else if (localLastUpdate > cloudLastUpdate && localTasks.length > 0) {
          await googleDrive.saveData(localTasks, localCache.users);
          toast.success(`Сохранено ${localTasks.length} задач в Google Drive`);
        } else {
          toast('Данные актуальны', {
            icon: '✅',
            duration: 2000,
          });
        }
      } else if (localTasks.length > 0) {
        await googleDrive.saveData(localTasks, localCache.users);
        toast.success(`Сохранено ${localTasks.length} задач в Google Drive`);
      }

      localCache.lastSync = new Date().toISOString();
      this.saveToLocalStorage();
      this.notify();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Ошибка синхронизации');
    } finally {
      this.syncInProgress = false;
    }
  }

  isAuthenticated(): boolean {
    return googleDrive.isAuthenticated();
  }

  getLastSync(): string | null {
    return localCache.lastSync;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('bugtracker-tasks', JSON.stringify(localCache.tasks));
    localStorage.setItem('bugtracker-users', JSON.stringify(localCache.users));
    if (localCache.lastSync) {
      localStorage.setItem('bugtracker-last-sync', localCache.lastSync);
    }
  }

  private loadFromLocalStorage(): { tasks: Task[]; users: User[] } {
    try {
      const tasks = localStorage.getItem('bugtracker-tasks');
      const users = localStorage.getItem('bugtracker-users');
      const lastSync = localStorage.getItem('bugtracker-last-sync');
      
      if (lastSync) localCache.lastSync = lastSync;
      
      return {
        tasks: tasks ? JSON.parse(tasks) : [],
        users: users ? JSON.parse(users) : [],
      };
    } catch {
      return { tasks: [], users: [] };
    }
  }
}

export const cloudStorage = CloudStorageService.getInstance();