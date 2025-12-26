import { type ReactNode } from 'react';
import { Badge } from './ItemCard';
import './CategorySection.css';

export interface CategorySectionProps {
  title: string;
  category: 'need' | 'good' | 'nice';
  itemCount: number;
  children: ReactNode;
  sticky?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function CategorySection({
  title,
  category,
  itemCount,
  children,
  sticky = false,
  collapsed = false,
  onToggleCollapse,
  className = '',
}: CategorySectionProps) {
  const stickyClass = sticky ? 'category-section--sticky' : '';
  const collapsedClass = collapsed ? 'category-section--collapsed' : '';

  return (
    <section className={`category-section ${stickyClass} ${collapsedClass} ${className}`}>
      <header className={`category-header category-header--${category}`}>
        <div className="category-header-content">
          <h2 className="category-title">{title}</h2>
          <Badge variant={category}>{itemCount}</Badge>
        </div>
        {onToggleCollapse && (
          <button
            className="category-toggle"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`category-toggle-icon ${collapsed ? 'category-toggle-icon--collapsed' : ''}`}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </header>
      <div className="category-content">{children}</div>
    </section>
  );
}
