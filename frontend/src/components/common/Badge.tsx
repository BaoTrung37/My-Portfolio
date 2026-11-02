import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full select-none transition-colors';

  const variantClasses = {
    primary: 'bg-blue-50 text-primary border border-primary/20',
    success: 'bg-success-bg text-success border border-success/30',
    warning: 'bg-warning-bg text-warning border border-warning/30',
    error: 'bg-error-bg text-error border border-error/30',
    neutral: 'bg-slate-100 text-neutral-secondary border border-neutral-divider',
    outline: 'bg-transparent text-neutral-secondary border border-neutral-divider',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-caption px-2.5 py-1',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
