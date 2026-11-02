import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm active:translate-y-px',
    secondary: 'bg-slate-100 text-neutral-title hover:bg-slate-200 shadow-sm active:translate-y-px',
    outline: 'border border-neutral-divider bg-transparent text-neutral-title hover:bg-slate-50 active:translate-y-px',
    ghost: 'bg-transparent text-neutral-secondary hover:text-neutral-title hover:bg-slate-100',
  };

  const sizeClasses = {
    sm: 'text-caption px-3 py-1.5 gap-1.5',
    md: 'text-body-1 px-4 py-2 gap-2 text-sm',
    lg: 'text-body-1 px-6 py-3 gap-2.5 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {isLoading && <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} className="mr-1" />}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
