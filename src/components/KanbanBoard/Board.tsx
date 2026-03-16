import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { Task, Status } from '../../types';
import { COLUMN_ORDER } from '../../utils/constants';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

interface BoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: Status) => Promise<void>;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

export const Board: React.FC<BoardProps> = ({
  tasks,
  onStatusChange,
  onTaskClick,
  onTaskEdit,
  onAddTask,
}) => {
  const {
    sensors,
    activeTask,
    overStatus,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    getColumnTasks,
  } = useDragAndDrop({
    tasks,
    onStatusChange,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 p-4 overflow-x-auto min-h-[calc(100vh-120px)]">
        {COLUMN_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={getColumnTasks(status)}
            onTaskClick={onTaskClick}
            onTaskEdit={onTaskEdit}
            onAddTask={onAddTask}
            isOver={overStatus === status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="transform scale-105 opacity-80 shadow-2xl">
            <TaskCard
              task={activeTask}
              onClick={onTaskClick}
              onEdit={onTaskEdit}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};