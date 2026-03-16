import { useState, useEffect, useCallback } from 'react';
import { Task, Status, Priority, Comment } from '../types';
import { storage } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasksCache] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []);

  // Load tasks from IndexedDB
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const loadedTasks = await storage.getTasks();
      // Больше не используем tasksCache как fallback с моковыми данными
      setTasks(loadedTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
      setTasks([]); // Пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const taskId = `BUG-${year}-${random}`;

      // Парсим description если он есть
      let severity: any = 'major';
      try {
        if (taskData.description) {
          const parsed = JSON.parse(taskData.description as string);
          severity = parsed.severity || 'major';
        }
      } catch (e) {
        // Ignore parsing error
      }

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

      await storage.saveTask(newTask);
      setTasks(prev => [...prev, newTask]);
      toast.success('Баг-репорт успешно создан');
      return newTask;
    } catch (err) {
      toast.error('Ошибка при создании баг-репорта');
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await storage.saveTask(updatedTask);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      toast.success('Задача обновлена');
      return updatedTask;
    } catch (err) {
      toast.error('Ошибка при обновлении задачи');
      throw err;
    }
  }, [tasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await storage.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Задача удалена');
    } catch (err) {
      toast.error('Ошибка при удалении задачи');
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: Status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedTask: Task = {
        ...task,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      // Оптимистичное обновление
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

      await storage.saveTask(updatedTask);
      toast.success(`Статус изменен на ${getStatusName(newStatus)}`);
    } catch (err) {
      // Откат при ошибке
      await loadTasks();
      toast.error('Ошибка при изменении статуса');
    }
  }, [tasks]);

  const addComment = useCallback(async (taskId: string, content: string, userId: string) => {
    try {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        taskId,
        userId,
        content,
        createdAt: new Date().toISOString(),
      };

      await storage.saveComment(newComment);

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask: Task = {
          ...task,
          commentIds: [...task.commentIds, newComment.id],
          updatedAt: new Date().toISOString(),
        };
        await storage.saveTask(updatedTask);
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }

      toast.success('Комментарий добавлен');
      return newComment;
    } catch (err) {
      toast.error('Ошибка при добавлении комментария');
      throw err;
    }
  }, [tasks]);

  // Фильтрация задач
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

  // Очистка всех задач (для отладки)
  const clearAllTasks = useCallback(async () => {
    try {
      await storage.clearAllTasks();
      setTasks([]);
      toast.success('Все задачи удалены');
    } catch (err) {
      toast.error('Ошибка при удалении задач');
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addComment,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByAssignee,
    searchTasks,
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