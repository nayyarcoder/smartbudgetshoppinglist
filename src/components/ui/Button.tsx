import { forwardRef, type ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      loading = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClass = `button--${variant}`;
    const sizeClass = `button--${size}`;
    const fullWidthClass = fullWidth ? 'button--full-width' : '';
    const loadingClass = loading ? 'button--loading' : '';

    return (
      <button
        ref={ref}
        className={`button ${variantClass} ${sizeClass} ${fullWidthClass} ${loadingClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="button-spinner">
            <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle className="spinner-circle" cx="12" cy="12" r="10" />
            </svg>
          </span>
        )}
        {!loading && icon && iconPosition === 'left' && <span className="button-icon">{icon}</span>}
        {children && <span className="button-label">{children}</span>}
        {!loading && icon && iconPosition === 'right' && <span className="button-icon">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
