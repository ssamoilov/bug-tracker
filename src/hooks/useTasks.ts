import { useState, useEffect, useCallback } from 'react';
import { Task, Status, Priority, Comment } from '../types';
import { cloudStorage } from '../services/cloudStorage';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Подписка на изменения хранилища
  useEffect(() => {
    const unsubscribe = cloudStorage.subscribe(() => {
      // Обновляем задачи при изменении в хранилище
      cloudStorage.loadTasks().then(loadedTasks => {
        setTasks(loadedTasks);
      });
    });

    return unsubscribe;
  }, []);

  // Загрузка задач
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const loadedTasks = await cloudStorage.loadTasks();
      setTasks(loadedTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание задачи
  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const taskId = `BUG-${year}-${random}`;

      let severity: any = 'major';
      try {
        if (taskData.description) {
          const parsed = JSON.parse(taskData.description as string);
          severity = parsed.severity || 'major';
        }
      } catch (e) {}

      const newTask: Task = {
        id: taskId,
        title: taskData.title || 'Без названия',
        description: taskData.description || '{}',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        severity: severity,
        reporterId: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: taskData.attachments || [],
        commentIds: [],
        ...taskData,
      };

      await cloudStorage.saveTask(newTask);
      toast.success('✅ Задача успешно создана');
      return newTask;
    } catch (err) {
      toast.error('Ошибка при создании задачи');
      throw err;
    }
  }, []);

  // Обновление задачи
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await cloudStorage.saveTask(updatedTask);
      toast.success('✏️ Задача обновлена');
      return updatedTask;
    } catch (err) {
      toast.error('Ошибка при обновлении задачи');
      throw err;
    }
  }, [tasks]);

  // Удаление задачи
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await cloudStorage.deleteTask(taskId);
      toast.success('🗑️ Задача удалена');
    } catch (err) {
      toast.error('Ошибка при удалении задачи');
      throw err;
    }
  }, []);

  // Изменение статуса
  const updateTaskStatus = useCallback(async (taskId: string, newStatus: Status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedTask: Task = {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      await cloudStorage.saveTask(updatedTask);
      toast.success(`📊 Статус изменен на ${getStatusName(newStatus)}`);
    } catch (err) {
      await loadTasks();
      toast.error('Ошибка при изменении статуса');
    }
  }, [tasks, loadTasks]);

  // Синхронизация с облаком
  const syncWithCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      await cloudStorage.syncWithCloud();
      await loadTasks();
    } catch (err) {
      toast.error('Ошибка синхронизации');
    } finally {
      setIsSyncing(false);
    }
  }, [loadTasks]);

  // Проверка авторизации
  const isAuthenticated = useCallback(() => {
    return cloudStorage.isAuthenticated();
  }, []);

  // Получение статуса синхронизации
  const getLastSync = useCallback(() => {
    return cloudStorage.getLastSync();
  }, []);

  // Очистка всех задач
  const clearAllTasks = useCallback(async () => {
    try {
      await cloudStorage.clearAllTasks();
      toast.success('Все данные удалены');
    } catch (err) {
      toast.error('Ошибка при удалении данных');
    }
  }, []);

  // Фильтрация
  const getTasksByStatus = useCallback((status: Status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Priority) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getTasksByAssignee = useCallback((assigneeId: string) => {
    return tasks.filter(task => task.assigneeId === assigneeId);
  }, [tasks]);

  const searchTasks = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.id.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    isSyncing,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByAssignee,
    searchTasks,
    syncWithCloud,
    isAuthenticated,
    getLastSync,
    clearAllTasks,
    refreshTasks: loadTasks,
  };
}

function getStatusName(status: Status): string {
  const names: Record<Status, string> = {
    todo: 'Новая',
    'in-progress': 'В работе',
    testing: 'Тестирование',
    done: 'Готово',
    failed: 'Провалено',
  };
  return names[status];
}