import React, { ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'light' | string;
export type ButtonSize = 'sm' | 'md' | 'lg' | 'large' | string;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  as?: React.ElementType;
  to?: string;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: var(--color-text);
        color: var(--color-background);
        border: none;
        box-shadow: var(--shadow-sm);
        
        &:hover:not(:disabled) {
          background-color: #333;
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          background-color: #111;
          transform: translateY(0);
          box-shadow: var(--shadow-sm);
        }
      `;
    case 'secondary':
      return css`
        background-color: var(--color-background);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
        
        &:hover:not(:disabled) {
          background-color: var(--color-hover);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          background-color: var(--color-focus);
          transform: translateY(0);
          box-shadow: var(--shadow-sm);
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: var(--color-text);
        border: none;
        
        &:hover:not(:disabled) {
          background-color: var(--color-hover);
        }
        
        &:active:not(:disabled) {
          background-color: var(--color-focus);
        }
      `;
    case 'danger':
      return css`
        background-color: #FFF0F0;
        color: #D32F2F;
        border: 1px solid #FFCDD2;
        
        &:hover:not(:disabled) {
          background-color: #FFEBEE;
        }
        
        &:active:not(:disabled) {
          background-color: #FFCDD2;
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return css`
        height: 32px;
        padding: 0 var(--space-3);
        font-size: var(--font-size-xs);
      `;
    case 'md':
      return css`
        height: 40px;
        padding: 0 var(--space-4);
        font-size: var(--font-size-sm);
      `;
    case 'lg':
      return css`
        height: 48px;
        padding: 0 var(--space-5);
        font-size: var(--font-size-md);
      `;
    default:
      return '';
  }
};

const ButtonContainer = styled.button<{
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-mono);
  line-height: 1;
  white-space: nowrap;
  width: ${(props) => props.$fullWidth ? '100%' : 'auto'};
  
  ${(props) => getVariantStyles(props.$variant || 'primary')}
  ${(props) => getSizeStyles(props.$size || 'md')}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </ButtonContainer>
  );
};

export default Button;
