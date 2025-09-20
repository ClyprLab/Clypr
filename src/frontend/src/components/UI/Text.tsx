import React, { ElementType } from 'react';
import styled from 'styled-components';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'mono' | 'mono-sm';
type TextAlign = 'left' | 'center' | 'right';
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';

interface TextProps {
  variant?: TextVariant;
  align?: TextAlign;
  weight?: FontWeight;
  color?: string;
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}

const getFontFamily = (variant: TextVariant) => {
  if (variant === 'mono' || variant === 'mono-sm') return 'var(--font-mono)';
  return 'var(--font-sans)';
};

const getFontSize = (variant: TextVariant) => {
  switch (variant) {
    case 'h1': return 'var(--font-size-2xl)';
    case 'h2': return 'var(--font-size-xl)';
    case 'h3': return 'var(--font-size-lg)';
    case 'h4': return 'var(--font-size-md)';
    case 'h5': return 'var(--font-size-sm)';
    case 'h6': return 'var(--font-size-xs)';
    case 'body': return 'var(--font-size-md)';
    case 'body-sm': return 'var(--font-size-sm)';
    case 'caption': return 'var(--font-size-xs)';
    case 'mono': return 'var(--font-size-md)';
    case 'mono-sm': return 'var(--font-size-sm)';
    default: return 'var(--font-size-md)';
  }
};

const getFontWeight = (weight: FontWeight) => {
  switch (weight) {
    case 'normal': return 400;
    case 'medium': return 500;
    case 'semibold': return 600;
    case 'bold': return 700;
    default: return 400;
  }
};

const getDefaultFontWeight = (variant: TextVariant): FontWeight => {
  if (variant.startsWith('h')) return 'semibold';
  return 'normal';
};

const getComponent = (variant: TextVariant) => {
  switch (variant) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'h5': return 'h5';
    case 'h6': return 'h6';
    case 'caption': return 'span';
    default: return 'p';
  }
};

const StyledText = styled.p<{
  $variant: TextVariant;
  $align: TextAlign;
  $weight: FontWeight;
  $color?: string;
}>`
  margin: 0;
  font-family: ${props => getFontFamily(props.$variant)};
  font-size: ${props => getFontSize(props.$variant)};
  font-weight: ${props => getFontWeight(props.$weight)};
  text-align: ${props => props.$align};
  color: ${props => props.$color || 'var(--color-text)'};
  line-height: 1.5;
`;

const Text: React.FC<TextProps> = ({
  variant = 'body',
  align = 'left',
  weight,
  color,
  children,
  className,
  as,
}) => {
  // Use the provided 'as' element type or get the default component based on variant
  const component = as || getComponent(variant);
  const finalWeight = weight || getDefaultFontWeight(variant);
  
  return (
    <StyledText
      as={component}
      $variant={variant}
      $align={align}
      $weight={finalWeight}
      $color={color}
      className={className}
    >
      {children}
    </StyledText>
  );
};

export default Text;
