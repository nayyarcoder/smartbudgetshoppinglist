import { type ReactNode } from 'react';
import './FloatingActionButton.css';

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export function FloatingActionButton({
  icon,
  label,
  position = 'bottom-right',
  className = '',
  children,
  ...props
}: FloatingActionButtonProps) {
  const positionClass = `fab--${position}`;

  return (
    <button className={`fab ${positionClass} ${className}`} {...props}>
      {icon && <span className="fab-icon">{icon}</span>}
      {(label || children) && <span className="fab-label">{label || children}</span>}
    </button>
  );
}

// Plus icon for "Add Item"
export function PlusIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
