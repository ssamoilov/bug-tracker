import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, Status } from '../../types';
import { TaskCard } from './TaskCard';
import { STATUSES } from '../../utils/constants';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ColumnProps {
  status: Status;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onAddTask?: (status: Status) => void;
  isOver?: boolean;
}

export const Column: React.FC<ColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  onTaskEdit,
  onAddTask,
  isOver,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { setNodeRef, isOver: isDraggingOver } = useDroppable({ 
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const column = STATUSES[status];

  // Цвета для градиента в зависимости от статуса
  const gradientColors = {
    todo: 'from-gray-500/20 to-gray-600/20',
    'in-progress': 'from-blue-500/20 to-blue-600/20',
    testing: 'from-orange-500/20 to-orange-600/20',
    done: 'from-green-500/20 to-green-600/20',
    failed: 'from-red-500/20 to-red-600/20',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-80 rounded-xl transition-all duration-300',
        'bg-gradient-to-b',
        gradientColors[status],
        (isOver || isDraggingOver) && 'ring-2 ring-primary ring-opacity-50 scale-[1.02] shadow-xl'
      )}
    >
      {/* Column header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-background/50 rounded-lg transition-all hover:scale-110"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xl">{column.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {tasks.length} {tasks.length === 1 ? 'задача' : 'задач'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddTask?.(status)}
              className="p-1.5 hover:bg-background/50 rounded-lg transition-all hover:scale-110 hover:text-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-background/50 rounded-lg transition-all hover:scale-110">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column content */}
      {!isCollapsed && (
        <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          <SortableContext
            items={tasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
                onEdit={onTaskEdit}
              />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className={cn(
              'p-8 text-center text-muted-foreground text-sm border-2 border-dashed rounded-lg transition-all',
              'bg-background/30 backdrop-blur-sm',
              (isOver || isDraggingOver) ? 'border-primary bg-primary/5' : 'border-border'
            )}>
              <p className="mb-2">✨ Пусто</p>
              <p className="text-xs">Перетащите задачу или создайте новую</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};