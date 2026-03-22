import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types';
import { Avatar } from '../UI/Avatar';
import { Badge } from '../UI/Badge';
import { formatShortDate } from '../../utils/dateUtils';
import { PRIORITIES } from '../../utils/constants';
import { MessageSquare, Paperclip, Edit2, GripVertical, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITIES[task.priority];
  const hasAttachments = task.attachments.length > 0;
  const hasComments = task.commentIds.length > 0;

  // Определяем цвет для severity
  const severityColor = {
    critical: 'bg-red-500',
    major: 'bg-orange-500',
    minor: 'bg-yellow-500',
    trivial: 'bg-blue-500',
  }[task.severity] || 'bg-gray-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative modern-card cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 scale-105 shadow-2xl rotate-1',
        'animate-scale-in'
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Priority indicator line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: priority.color }}
      />

      {/* Severity badge */}
      <div className={cn('absolute top-3 right-3 w-2 h-2 rounded-full', severityColor)} />

      <div className="p-4">
        {/* Header with ID and drag handle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="font-mono text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md">
              {task.id}
            </span>
          </div>
          
          {/* Quick edit button on hover */}
          {!isDragging && (
            <button
              className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border 
                         opacity-0 group-hover:opacity-100 transition-all hover:bg-background 
                         hover:shadow-md hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {task.title}
        </h3>

        {/* Priority badge */}
        <div className="mb-3">
          <Badge 
            variant="info" 
            className="text-xs"
            // style={{ backgroundColor: `${priority.color}20`, color: priority.color }}
          >
            {priority.icon} {priority.label}
          </Badge>
        </div>

        {/* Attachments preview */}
        {task.attachments.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {task.attachments.slice(0, 3).map((attachment, index) => (
              <div
                key={attachment.id}
                className="w-6 h-6 rounded-full bg-secondary border-2 border-background overflow-hidden shadow-sm"
                style={{ zIndex: 3 - index }}
              >
                {attachment.thumbnail ? (
                  <img
                    src={attachment.thumbnail}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs bg-secondary">
                    📎
                  </div>
                )}
              </div>
            ))}
            {task.attachments.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1 font-mono">
                +{task.attachments.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            {/* Attachments count */}
            {hasAttachments && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="font-mono">{task.attachments.length}</span>
              </div>
            )}
            
            {/* Comments count */}
            {hasComments && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-mono">{task.commentIds.length}</span>
              </div>
            )}
          </div>

          {/* Date and assignee */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatShortDate(task.createdAt)}</span>
            </div>
            {task.assigneeId && (
              <Avatar
                initials="АР"
                size="sm"
                className="ring-2 ring-background"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};