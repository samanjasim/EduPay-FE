import { useState } from 'react';
import { cn } from '@/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400',
    'bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-400',
    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

export function Avatar({ src, alt, name = '', size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const showFallback = !src || imageError;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium',
        sizes[size],
        showFallback && getColorFromName(name),
        className
      )}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name) || '?'}</span>
      )}
    </div>
  );
}
