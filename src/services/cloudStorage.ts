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
  private autoSyncTimer: NodeJS.Timeout | null = null;
  private lastSaveTime: number = 0;
  private readonly AUTO_SYNC_INTERVAL = 30000; // 30 секунд
  private readonly SAVE_DEBOUNCE = 2000; // 2 секунды после изменений

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

  // Автоматическая синхронизация
  startAutoSync() {
    if (this.autoSyncTimer) return;
    
    this.autoSyncTimer = setInterval(() => {
      this.autoSync();
    }, this.AUTO_SYNC_INTERVAL);
    
    console.log('Auto-sync started');
  }

  stopAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      console.log('Auto-sync stopped');
    }
  }

  private async autoSync() {
    if (this.syncInProgress) return;
    if (!googleDrive.isAuthenticated()) return;
    
    try {
      console.log('Auto-sync checking for updates...');
      const cloudData = await googleDrive.loadData();
      const localTasks = localCache.tasks;
      
      if (cloudData && cloudData.tasks.length > 0) {
        const cloudLastUpdate = Math.max(...cloudData.tasks.map(t => new Date(t.updatedAt).getTime()));
        const localLastUpdate = localTasks.length > 0 
          ? Math.max(...localTasks.map(t => new Date(t.updatedAt).getTime()))
          : 0;
        
        // Если в облаке новее данные
        if (cloudLastUpdate > localLastUpdate) {
          console.log('Auto-sync: Newer data found in cloud, loading...');
          localCache.tasks = cloudData.tasks;
          localCache.users = cloudData.users;
          this.saveToLocalStorage();
          this.notify();
          toast('Обнаружены новые данные в облаке', {
            icon: '☁️',
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  }

  // Дебаунс для сохранения
  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.performSave();
    }, this.SAVE_DEBOUNCE);
  }
  
  private saveTimer: NodeJS.Timeout | null = null;
  
  private async performSave() {
    if (!googleDrive.isAuthenticated()) return;
    if (Date.now() - this.lastSaveTime < this.SAVE_DEBOUNCE) return;
    
    try {
      await googleDrive.saveData(localCache.tasks, localCache.users);
      this.lastSaveTime = Date.now();
      localCache.lastSync = new Date().toISOString();
      this.saveToLocalStorage();
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }

  async loadTasks(): Promise<Task[]> {
    try {
      // Загружаем из localStorage сначала для быстрого отображения
      const localData = this.loadFromLocalStorage();
      if (localData.tasks.length > 0) {
        localCache.tasks = localData.tasks;
        localCache.users = localData.users;
      }
      
      // Затем асинхронно загружаем из облака, если авторизованы
      if (googleDrive.isAuthenticated()) {
        const cloudData = await googleDrive.loadData();
        if (cloudData && cloudData.tasks.length > 0) {
          // Сравниваем даты и берем более новые
          const cloudLastUpdate = Math.max(...cloudData.tasks.map(t => new Date(t.updatedAt).getTime()));
          const localLastUpdate = localCache.tasks.length > 0 
            ? Math.max(...localCache.tasks.map(t => new Date(t.updatedAt).getTime()))
            : 0;
          
          if (cloudLastUpdate > localLastUpdate) {
            localCache.tasks = cloudData.tasks;
            localCache.users = cloudData.users;
            this.saveToLocalStorage();
            this.notify();
            console.log('Loaded newer data from cloud');
          } else if (localLastUpdate > cloudLastUpdate && localCache.tasks.length > 0) {
            // Локальные данные новее, сохраняем в облако
            await googleDrive.saveData(localCache.tasks, localCache.users);
            console.log('Saved local data to cloud');
          }
        } else if (localCache.tasks.length > 0) {
          // Нет данных в облаке, сохраняем локальные
          await googleDrive.saveData(localCache.tasks, localCache.users);
          console.log('Initial save to cloud');
        }
        
        localCache.lastSync = new Date().toISOString();
        this.saveToLocalStorage();
        this.startAutoSync();
      }
      
      return localCache.tasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return localCache.tasks;
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

      // Автоматическое сохранение в облако
      if (googleDrive.isAuthenticated()) {
        this.scheduleSave();
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
        this.scheduleSave();
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
        this.scheduleSave();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async syncNow(): Promise<void> {
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
          this.notify();
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