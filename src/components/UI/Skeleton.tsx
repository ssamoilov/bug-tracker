import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = true,
}) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(
        'bg-secondary/50',
        variants[variant],
        animation && 'animate-pulse',
        className
      )}
      style={style}
    />
  );
};

// Композиция для карточки задачи
export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton width={80} height={16} />
        <Skeleton width={60} height={20} variant="rectangular" />
      </div>
      <Skeleton width="100%" height={20} />
      <Skeleton width="70%" height={20} />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={16} />
          <Skeleton width={40} height={16} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={50} height={16} />
          <Skeleton width={24} height={24} variant="circular" />
        </div>
      </div>
    </div>
  );
};

// Скелетон для колонки
export const ColumnSkeleton: React.FC = () => {
  return (
    <div className="w-80 bg-secondary/20 rounded-xl">
      <div className="p-4 bg-gradient-todo rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width={20} height={20} variant="circular" />
            <Skeleton width={80} height={20} />
          </div>
          <Skeleton width={30} height={24} variant="rectangular" />
        </div>
      </div>
      <div className="p-2 space-y-2">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
};