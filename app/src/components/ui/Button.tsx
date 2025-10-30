import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: any) => void;
  type?: 'button' | 'submit' | 'reset';
  innerRef?: any;
  [key: string]: any;
}

export const Button = (
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    className = '',
    disabled,
    innerRef,
    ...props
  }: ButtonProps
) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      ${fullWidth ? 'w-full' : ''}
    `;

    const variantStyles = {
      primary: `
        bg-gradient-to-r from-[#6366f1] to-[#a78bfa]
        text-white border border-transparent
        hover:from-[#4f46e5] hover:to-[#9333ea]
        hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]
        active:scale-[0.98]
        focus-visible:outline-[#6366f1]
      `,
      secondary: `
        bg-[rgba(99,102,241,0.1)] text-[#6366f1]
        border border-[rgba(99,102,241,0.2)]
        hover:bg-[rgba(99,102,241,0.2)]
        active:scale-[0.98]
        focus-visible:outline-[#6366f1]
      `,
      ghost: `
        bg-transparent text-[#cbd5e1]
        border border-transparent
        hover:bg-[rgba(255,255,255,0.05)]
        active:scale-[0.98]
        focus-visible:outline-[#94a3b8]
      `,
      danger: `
        bg-[#ef4444] text-white
        border border-transparent
        hover:bg-[#dc2626]
        hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
        active:scale-[0.98]
        focus-visible:outline-[#ef4444]
      `,
    };

    const sizeStyles = {
      xs: 'h-7 px-3 text-xs',
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-[52px] px-8 text-lg',
      xl: 'h-[60px] px-10 text-xl',
    };

    const variantClass = variantStyles[variant as keyof typeof variantStyles];
    const sizeClass = sizeStyles[size as keyof typeof sizeStyles];

    return (
      <button
        ref={innerRef}
        className={`
          ${baseStyles}
          ${variantClass}
          ${sizeClass}
          ${className}
        `.trim()}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
};

Button.displayName = 'Button';
