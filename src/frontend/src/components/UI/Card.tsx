import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  elevation?: 'flat' | 'low' | 'medium' | 'high';
  className?: string;
}

const pad = (p: NonNullable<CardProps['padding']>) => {
  switch (p) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-3';
    case 'lg':
      return 'p-5';
    case 'md':
    default:
      return 'p-4';
  }
};

const shadow = (e: NonNullable<CardProps['elevation']>) => {
  switch (e) {
    case 'flat':
      return 'shadow-none';
    case 'low':
      return 'shadow-sm';
    case 'medium':
      return 'shadow-md';
    case 'high':
      return 'shadow-lg';
    default:
      return 'shadow-sm';
  }
};

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  padding = 'md',
  elevation = 'low',
  className,
}) => {
  const container = [
    'flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-lg transition',
    shadow(elevation),
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  const hasHeader = !!(title || subtitle);

  return (
    <div className={container}>
      {hasHeader && (
        <div className={`border-b border-neutral-800 ${pad('md')} pb-2`}>
          {title && <h3 className="font-mono text-lg font-semibold m-0 text-neutral-100">{title}</h3>}
          {subtitle && <p className="text-sm text-neutral-400 mt-1 mb-0">{subtitle}</p>}
        </div>
      )}
      <div className={pad(padding)}>
        {children}
      </div>
      {footer && (
        <div className={`border-t border-neutral-800 ${pad('md')}`}>{footer}</div>
      )}
    </div>
  );
};

export default Card;
