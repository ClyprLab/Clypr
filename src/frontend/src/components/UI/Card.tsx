import React from 'react';
import theme from '../../styles/theme';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'glass';
};

export const Card = ({ children, variant = 'default', ...rest }: CardProps) => {
  const base = `rounded-lg p-4`;
  const variants: Record<string, string> = {
    default: `bg-[${theme.colors.panel}] border border-[${theme.colors.border}]`,
    glass: `bg-[${theme.colors.glass}] backdrop-blur-sm border border-[${theme.colors.border}]`
  };

  const className = `${base} ${variants[variant]} ${rest.className ?? ''}`;

  return (
    <div {...rest} className={className}>
      {children}
    </div>
  );
};

export default Card;
