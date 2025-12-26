import { useEffect, useState } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  gradient?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant = 'default',
  gradient = false,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  // Animate progress bar fill with spring effect
  useEffect(() => {
    if (animated) {
      const timeout = setTimeout(() => {
        setDisplayValue(percentage);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  // Determine variant based on percentage if not explicitly set
  const getVariant = () => {
    if (variant !== 'default') return variant;
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const currentVariant = getVariant();
  const variantClass = `progress-bar--${currentVariant}`;
  const gradientClass = gradient ? 'progress-bar--gradient' : '';
  const animatedClass = animated ? 'progress-bar--animated' : '';

  return (
    <div className={`progress-bar-container ${className}`}>
      {label && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label}</span>
          {showPercentage && (
            <span className="progress-bar-percentage">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`progress-bar ${variantClass} ${gradientClass}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={`progress-bar-fill ${animatedClass}`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}
