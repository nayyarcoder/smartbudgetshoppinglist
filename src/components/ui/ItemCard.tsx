import { type ReactNode } from 'react';
import './ItemCard.css';

export interface ItemCardProps {
  children: ReactNode;
  priority?: 'need' | 'good' | 'nice';
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
}

export function ItemCard({
  children,
  priority,
  isDragging = false,
  onDragStart,
  onDragEnd,
  className = '',
}: ItemCardProps) {
  const priorityClass = priority ? `item-card--${priority}` : '';
  const draggingClass = isDragging ? 'item-card--dragging' : '';
  
  return (
    <div
      className={`item-card ${priorityClass} ${draggingClass} ${className}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {children}
    </div>
  );
}

export interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <div className={`drag-handle ${className}`} aria-label="Drag handle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="7" r="1.5" fill="currentColor" />
        <circle cx="15" cy="7" r="1.5" fill="currentColor" />
        <circle cx="9" cy="12" r="1.5" fill="currentColor" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
        <circle cx="9" cy="17" r="1.5" fill="currentColor" />
        <circle cx="15" cy="17" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export interface BadgeProps {
  children: ReactNode;
  variant?: 'need' | 'good' | 'nice' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {children}
    </span>
  );
}
