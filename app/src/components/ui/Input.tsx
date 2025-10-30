import * as React from 'react';

export interface InputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  innerRef?: any;
  className?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: any;
  onBlur?: any;
  onFocus?: any;
}

export const Input = (
  {
    label,
    error,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    innerRef,
    ...props
  }: InputProps
) => {
  const inputStyles = `
    h-11 px-4 rounded-lg
    bg-[#0f172a] border border-[#334155]
    text-[#f1f5f9] placeholder:text-[#94a3b8]
    transition-all duration-200
    focus:outline-none focus:border-[#6366f1]
    focus:ring-2 focus:ring-[rgba(99,102,241,0.2)]
    disabled:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.2)]' : ''}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-[#cbd5e1] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            {leftIcon}
          </div>
        )}
        <input
          ref={innerRef}
          className={`${inputStyles} ${className}`.trim()}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-[#ef4444]">{error}</p>
      )}
    </div>
  );
};

Input.displayName = 'Input';
