import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  elevation?: 'flat' | 'low' | 'medium' | 'high';
}

const getPaddingValue = (padding: CardProps['padding']) => {
  switch (padding) {
    case 'sm': return 'var(--space-3)';
    case 'md': return 'var(--space-4)';
    case 'lg': return 'var(--space-5)';
    case 'none': return '0';
    default: return 'var(--space-4)';
  }
};

const getElevationStyle = (elevation: CardProps['elevation']) => {
  switch (elevation) {
    case 'flat': return 'none';
    case 'low': return 'var(--shadow-sm)';
    case 'medium': return 'var(--shadow-md)';
    case 'high': return 'var(--shadow-lg)';
    default: return 'var(--shadow-sm)';
  }
};

const CardContainer = styled.div<{ elevation: NonNullable<CardProps['elevation']> }>`
  display: flex;
  flex-direction: column;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: ${props => getElevationStyle(props.elevation)};
  overflow: hidden;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
  
  &:hover {
    box-shadow: ${props => props.elevation === 'flat' ? 'var(--shadow-sm)' : 'var(--shadow-md)'};
    transform: ${props => props.elevation === 'flat' ? 'none' : 'translateY(-2px)'};
  }
`;

const CardHeader = styled.div<{ hasPadding: boolean }>`
  padding: ${props => props.hasPadding ? getPaddingValue('md') : '0'};
  padding-bottom: ${props => props.hasPadding ? 'var(--space-2)' : '0'};
`;

const CardTitle = styled.h3`
  font-family: var(--font-mono);
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
`;

const CardSubtitle = styled.p`
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin: var(--space-1) 0 0 0;
`;

const CardContent = styled.div<{ padding: NonNullable<CardProps['padding']> }>`
  flex: 1;
  padding: ${props => getPaddingValue(props.padding)};
`;

const CardFooter = styled.div<{ hasPadding: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: ${props => props.hasPadding ? getPaddingValue('md') : '0'};
  border-top: 1px solid var(--color-border);
`;

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  padding = 'md',
  elevation = 'low'
}) => {
  const hasHeader = !!(title || subtitle);
  
  return (
    <CardContainer elevation={elevation}>
      {hasHeader && (
        <CardHeader hasPadding={padding !== 'none'}>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardContent padding={padding}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter hasPadding={padding !== 'none'}>
          {footer}
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default Card;
