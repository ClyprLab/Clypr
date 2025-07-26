import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const InputLabel = styled.label`
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin-bottom: var(--space-1);
  font-family: var(--font-sans);
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  height: 40px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-sm);
  font-family: var(--font-mono);
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid ${props => props.hasError ? 'var(--color-error)' : 'var(--color-border)'};
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? 'var(--color-error)' : 'var(--color-focus-border)'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(224, 36, 36, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
  
  &:disabled {
    background-color: var(--color-disabled);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-top: var(--space-1);
  font-family: var(--font-sans);
`;

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  ...props
}) => {
  const inputId = React.useId();
  
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}
      <StyledInput 
        id={inputId}
        hasError={!!error} 
        {...props} 
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
