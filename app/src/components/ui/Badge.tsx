import * as React from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  innerRef?: any;
}

export const Badge = (
  {
    variant = 'default',
    size = 'md',
    children,
    className = '',
    innerRef,
    ...props
  }: BadgeProps
) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-full
    transition-colors duration-200
  `;

  const variantStyles: Record<string, string> = {
    default: 'bg-[#334155] text-[#cbd5e1]',
    success: 'bg-[rgba(16,185,129,0.1)] text-[#10b981] border border-[rgba(16,185,129,0.2)]',
    warning: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b] border border-[rgba(245,158,11,0.2)]',
    danger: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]',
    info: 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6] border border-[rgba(59,130,246,0.2)]',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      ref={innerRef}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
