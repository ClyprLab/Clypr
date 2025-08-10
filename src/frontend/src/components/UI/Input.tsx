import React from 'react';

function Input(props: any) {
  const { label, error, fullWidth = false, className, id, ...rest } = props;
  const inputId = id || React.useId();

  return (
    <div className={[fullWidth ? 'w-full' : 'w-auto', 'flex flex-col'].join(' ')}>
      {label && (
        <label htmlFor={inputId} className="text-sm text-neutral-400 mb-1 font-sans">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'h-10 px-3 text-sm font-mono rounded-md transition outline-none',
          'bg-neutral-950 text-neutral-100 border',
          error ? 'border-red-600 focus:ring-0 focus:border-red-500' : 'border-neutral-800 focus:border-neutral-600 focus:ring-0',
          'disabled:bg-neutral-900 disabled:text-neutral-500 disabled:cursor-not-allowed',
          className || '',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1 font-sans">{error}</span>
      )}
    </div>
  );
}

export default Input;
