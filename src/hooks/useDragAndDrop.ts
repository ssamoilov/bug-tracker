import { useCallback, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, Status } from '../types';

interface UseDragAndDropProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: Status) => Promise<void>;
}

export function useDragAndDrop({ tasks, onStatusChange }: UseDragAndDropProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overStatus, setOverStatus] = useState<Status | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    console.log('Drag start:', active.id);
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      console.log('Drag over:', over.id);
      // Определяем статус колонки
      if (over.data.current?.type === 'column') {
        setOverStatus(over.id as Status);
      }
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag end:', { active: active.id, over: over?.id });
    
    setActiveTask(null);
    setOverStatus(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Получаем новый статус
    let newStatus: Status = activeTask.status;
    
    if (over.data.current?.type === 'column') {
      newStatus = over.id as Status;
    } else if (over.data.current?.type === 'task') {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Если статус изменился
    if (newStatus !== activeTask.status) {
      console.log(`Moving task from ${activeTask.status} to ${newStatus}`);
      await onStatusChange(activeTask.id, newStatus);
    }
  }, [tasks, onStatusChange]);

  const getColumnTasks = useCallback((status: Status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    sensors,
    activeTask,
    overStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getColumnTasks,
    DndContext,
    SortableContext,
    DragOverlay,
    closestCorners,
    verticalListSortingStrategy,
  };
}