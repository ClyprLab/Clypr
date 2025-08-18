import React from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'ghost' 
  | 'outline' 
  | 'gradient'
  | 'glass'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-white text-neutral-950 font-semibold
    hover:bg-neutral-100 active:bg-neutral-200
    shadow-sm hover:shadow-md
    transition-all duration-200
    focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  secondary: `
    bg-neutral-800 text-white border border-neutral-700
    hover:bg-neutral-700 hover:border-neutral-600
    active:bg-neutral-600
    shadow-sm hover:shadow-md
    transition-all duration-200
    focus:ring-2 focus:ring-neutral-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  ghost: `
    bg-transparent text-neutral-300
    hover:bg-neutral-800 hover:text-white
    active:bg-neutral-700
    transition-all duration-200
    focus:ring-2 focus:ring-neutral-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  outline: `
    bg-transparent text-white border border-neutral-600
    hover:bg-neutral-800 hover:border-neutral-500
    active:bg-neutral-700
    transition-all duration-200
    focus:ring-2 focus:ring-neutral-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  gradient: `
    bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-neutral-950 font-semibold
    hover:from-cyan-300 hover:to-fuchsia-400
    active:from-cyan-500 active:to-fuchsia-600
    shadow-lg hover:shadow-xl hover:shadow-cyan-500/25
    transition-all duration-300 transform hover:scale-[1.02]
    focus:ring-2 focus:ring-cyan-400/30 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  glass: `
    bg-white/5 backdrop-blur-sm border border-white/10 text-white
    hover:bg-white/10 hover:border-white/20
    active:bg-white/15
    shadow-sm hover:shadow-md
    transition-all duration-200
    focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  danger: `
    bg-red-500/10 border border-red-500/20 text-red-400
    hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300
    active:bg-red-500/30
    transition-all duration-200
    focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
  success: `
    bg-green-500/10 border border-green-500/20 text-green-400
    hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-300
    active:bg-green-500/30
    transition-all duration-200
    focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2 focus:ring-offset-neutral-950
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  xl: 'h-14 px-8 text-lg gap-3',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        'select-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && leftIcon && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}
      
      <span className="flex-shrink-0">{children}</span>
      
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}

export default Button;
