import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export type InputVariant = 'default' | 'floating' | 'glass' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<InputVariant, string> = {
  default: `
    bg-neutral-900/50 border border-neutral-700
    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
    placeholder:text-neutral-500
    transition-all duration-200
  `,
  floating: `
    bg-neutral-900/50 border border-neutral-700
    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
    placeholder:text-transparent
    peer
    transition-all duration-200
  `,
  glass: `
    bg-white/5 backdrop-blur-sm border border-white/10
    focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20
    placeholder:text-neutral-400
    transition-all duration-200
  `,
  outlined: `
    bg-transparent border-2 border-neutral-600
    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20
    placeholder:text-neutral-500
    transition-all duration-200
  `,
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
};

const stateStyles = {
  error: `
    border-red-500 focus:border-red-500 focus:ring-red-500/20
    text-red-400
  `,
  success: `
    border-green-500 focus:border-green-500 focus:ring-green-500/20
    text-green-400
  `,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      error,
      success,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'rounded-lg text-white outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          hasError && stateStyles.error,
          hasSuccess && stateStyles.success,
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );

    if (variant === 'floating' && label) {
      return (
        <div className={cn('relative', fullWidth && 'w-full')}>
          {inputElement}
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 text-neutral-400 transition-all duration-200',
              'peer-focus:text-cyan-400 peer-focus:scale-90 peer-focus:-translate-y-6',
              'peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:-translate-y-6',
              'peer-[:not(:placeholder-shown)]:text-neutral-300',
              size === 'sm' && 'text-sm top-1',
              size === 'md' && 'text-sm top-2.5',
              size === 'lg' && 'text-base top-3',
              hasError && 'text-red-400 peer-focus:text-red-400',
              hasSuccess && 'text-green-400 peer-focus:text-green-400'
            )}
          >
            {label}
          </label>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-400">{error}</p>
          )}
        </div>
      );
    }

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}
        {inputElement}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
