import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  initials, 
  size = 'md',
  className 
}) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
};