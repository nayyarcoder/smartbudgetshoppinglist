import { useState, useEffect, forwardRef } from 'react';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  currency?: boolean;
  onChange?: (value: string, rawValue: number | null) => void;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, currency, onChange, icon, className = '', ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (props.value !== undefined && currency) {
        const numValue = typeof props.value === 'string' ? parseFloat(props.value) : props.value;
        if (!isNaN(numValue as number)) {
          setDisplayValue(formatCurrency(numValue as number));
        }
      }
    }, [props.value, currency]);

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (currency) {
        // Remove all non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(numericValue);
        const isValid = !isNaN(parsed) && parsed >= 0;

        setDisplayValue(value);

        if (onChange) {
          onChange(value, isValid ? parsed : null);
        }
      } else {
        if (onChange) {
          onChange(value, null);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (currency && displayValue) {
        const numericValue = displayValue.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(numericValue);
        if (!isNaN(parsed)) {
          setDisplayValue(formatCurrency(parsed));
        }
      }
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (currency && displayValue) {
        // Show raw number when focused
        const numericValue = displayValue.replace(/[^0-9.]/g, '');
        setDisplayValue(numericValue);
      }
      props.onFocus?.(e);
    };

    const hasError = !!error;
    const inputClasses = [
      'input-field',
      hasError && 'input-field--error',
      isFocused && 'input-field--focused',
      icon && 'input-field--with-icon',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={props.id} className="input-label">
            {label}
          </label>
        )}
        <div className="input-container">
          {icon && <div className="input-icon">{icon}</div>}
          <input
            ref={ref}
            className={inputClasses}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            value={currency ? displayValue : props.value}
            {...props}
          />
        </div>
        {error && (
          <div className="input-error" role="alert">
            {error}
          </div>
        )}
        {helperText && !error && <div className="input-helper">{helperText}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
