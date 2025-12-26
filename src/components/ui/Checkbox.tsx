import { forwardRef } from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  large?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, large = false, className = '', ...props }, ref) => {
    const sizeClass = large ? 'checkbox--large' : '';

    return (
      <label className={`checkbox-wrapper ${className}`}>
        <input ref={ref} type="checkbox" className="checkbox-input" {...props} />
        <span className={`checkbox-custom ${sizeClass}`}>
          <svg
            className="checkbox-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label && <span className="checkbox-label">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
