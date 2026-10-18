import React from 'react';

/**
 * Standard container component with responsive max-width and horizontal padding.
 */
export default function Container({ children, className = '', size = 'xl', ...props }) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size] || sizeClasses.xl} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
