import React from 'react';
import theme from '../../styles/theme';

// Keep string unions in runtime via JSDoc for docs; avoid TS React types to bypass IDE issues
/** @typedef {'primary'|'secondary'|'ghost'|'danger'|'outline'|'light'|string} ButtonVariant */
/** @typedef {'sm'|'md'|'lg'|'large'|string} ButtonSize */

const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:ring-offset-0 select-none whitespace-nowrap shadow-sm';

const variantClasses = (variant /** @type {ButtonVariant} */) => {
  switch (variant) {
    case 'primary':
      return 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300';
    case 'secondary':
      return 'bg-transparent text-neutral-100 border border-neutral-800 hover:bg-neutral-900/60 active:bg-neutral-900';
    case 'ghost':
      return 'bg-transparent text-neutral-200 hover:bg-neutral-900/60 active:bg-neutral-900';
    case 'danger':
      return 'border border-red-700/50 text-red-400 bg-red-500/10 hover:bg-red-500/20';
    case 'outline':
      return 'bg-transparent text-neutral-100 border border-neutral-700 hover:bg-neutral-900/60';
    case 'light':
      return 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700';
    default:
      return 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200';
  }
};

const sizeClasses = (size /** @type {ButtonSize} */) => {
  switch (size) {
    case 'sm':
      return 'h-8 px-3 text-xs';
    case 'md':
      return 'h-10 px-4 text-sm';
    case 'lg':
    case 'large':
      return 'h-12 px-5 text-base';
    default:
      return 'h-10 px-4 text-sm';
  }
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export function Button(props /** @type {any} */) {
  const { children, variant = 'primary', size = 'md', fullWidth = false, className: userClassName, ...rest } = props;
  const classes = [
    baseClasses,
    variantClasses(variant),
    sizeClasses(size),
    fullWidth ? 'w-full' : '',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    userClassName || ''
  ]
    .filter(Boolean)
    .join(' ');

  const base = `inline-flex items-center justify-center font-semibold transition-all ${
    size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-base'
  } rounded`;

  const variants: Record<string, string> = {
    primary: `bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black shadow-md`,
    ghost: `bg-transparent text-${theme.colors.text} hover:bg-white/2`,
    outline: `bg-transparent border border-gray-700 text-${theme.colors.text}`
  };

  const finalClassName = `${base} ${variants[variant]} ${rest.className ?? ''}`;

  return (
    <button {...rest} className={finalClassName}>
      {children}
    </button>
  );
}

export default Button;
