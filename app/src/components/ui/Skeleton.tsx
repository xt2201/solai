import * as React from "react";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  className?: string;
  innerRef?: any;
  [key: string]: any;
}

export const Skeleton = ({ 
  variant = "rectangular", 
  width, 
  height, 
  animation = "pulse", 
  className = "", 
  innerRef,
  ...props 
}: SkeletonProps) => {
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const inlineStyles: { width?: string; height?: string } = {};
  if (width) inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  if (height) inlineStyles.height = typeof height === "number" ? `${height}px` : height;

  const variantClass = variantStyles[variant as keyof typeof variantStyles];
  const animationClass = animationStyles[animation as keyof typeof animationStyles];

  return (
    <div
      ref={innerRef}
      className={`bg-[var(--bg-tertiary)] ${variantClass} ${animationClass} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};
