import React from 'react';
import { cn } from '../../utils/cn';

export type CardVariant = 
  | 'default' 
  | 'glass' 
  | 'gradient' 
  | 'stats' 
  | 'elevated'
  | 'outlined';

export type CardHover = 
  | 'none' 
  | 'lift' 
  | 'glow' 
  | 'scale' 
  | 'border';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: CardHover;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-neutral-900/50 border border-neutral-800
    shadow-sm
  `,
  glass: `
    bg-white/5 backdrop-blur-sm border border-white/10
    shadow-sm
  `,
  gradient: `
    bg-gradient-to-br from-neutral-900/80 to-neutral-800/80
    border border-neutral-700/50
    shadow-lg
  `,
  stats: `
    bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10
    border border-cyan-500/20
    shadow-md
  `,
  elevated: `
    bg-neutral-900/80 border border-neutral-700
    shadow-xl
  `,
  outlined: `
    bg-transparent border-2 border-neutral-700
    shadow-none
  `,
};

const hoverStyles: Record<CardHover, string> = {
  none: '',
  lift: `
    hover:transform hover:-translate-y-1 hover:shadow-lg
    transition-all duration-300 ease-out
  `,
  glow: `
    hover:shadow-glow-gradient hover:border-cyan-500/30
    transition-all duration-300 ease-out
  `,
  scale: `
    hover:transform hover:scale-[1.02] hover:shadow-lg
    transition-all duration-300 ease-out
  `,
  border: `
    hover:border-neutral-600 hover:bg-neutral-800/50
    transition-all duration-200 ease-out
  `,
};

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export function Card({
  variant = 'default',
  hover = 'none',
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variantStyles[variant],
        hoverStyles[hover],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Specialized card components for common use cases
export function StatsCard({ children, className, ...props }: CardProps) {
  return (
    <Card
      variant="stats"
      hover="glow"
      className={cn('text-center', className)}
      {...props}
    >
      {children}
    </Card>
  );
}

export function GlassCard({ children, className, ...props }: CardProps) {
  return (
    <Card
      variant="glass"
      hover="border"
      className={className}
      {...props}
    >
      {children}
    </Card>
  );
}

export function GradientCard({ children, className, ...props }: CardProps) {
  return (
    <Card
      variant="gradient"
      hover="scale"
      className={className}
      {...props}
    >
      {children}
    </Card>
  );
}

export default Card;
