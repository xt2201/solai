import * as React from 'react';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  innerRef?: any;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Card = (
  {
    variant = 'default',
    padding = 'md',
    hover = false,
    children,
    className = '',
    innerRef,
    ...props
  }: CardProps
) => {
  const baseStyles = `
    rounded-xl border transition-all duration-250
  `;

  const variantStyles = {
    default: `
      bg-[#1e293b] border-[#334155]
      shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]
      ${hover ? 'hover:border-[#475569] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:-translate-y-0.5' : ''}
    `,
    elevated: `
      bg-gradient-to-br from-[#1e293b] to-[#312e81]
      border-[rgba(99,102,241,0.2)]
      shadow-[0_0_40px_rgba(99,102,241,0.2)]
    `,
    interactive: `
      bg-[#1e293b] border-[#334155]
      cursor-pointer
      hover:border-[#475569] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] hover:-translate-y-1
    `,
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      ref={innerRef}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

Card.displayName = 'Card';

export interface CardHeaderProps {
  bordered?: boolean;
  children?: React.ReactNode;
  className?: string;
  innerRef?: any;
}

export const CardHeader = (
  { bordered = false, children, className = '', innerRef, ...props }: CardHeaderProps
) => {
  return (
    <div
      ref={innerRef}
      className={`
        flex items-center justify-between mb-4
        ${bordered ? 'pb-4 border-b border-[#334155]' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
  className?: string;
  innerRef?: any;
}

export const CardTitle = (
  { as = 'h3', children, className = '', innerRef, ...props }: CardTitleProps
) => {
  const Tag = as;
  return (
    <Tag
      ref={innerRef}
      className={`
        text-lg font-semibold text-[#f1f5f9]
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </Tag>
  );
};

CardTitle.displayName = 'CardTitle';

export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
  innerRef?: any;
}

export const CardContent = (
  { children, className = '', innerRef, ...props }: CardContentProps
) => {
  return (
    <div ref={innerRef} className={className} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';
