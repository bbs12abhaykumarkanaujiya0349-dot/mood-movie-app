import React from 'react';

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1
}) {
  const variantStyles = {
    circular: 'rounded-full',
    text: 'rounded-md h-4 my-1',
    rectangular: 'rounded-xl'
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const skeletonItems = Array.from({ length: count }, (_, idx) => (
    <div
      key={idx}
      style={style}
      className={`animate-pulse bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 bg-[length:200%_100%] ${
        variantStyles[variant] || variantStyles.rectangular
      } ${className}`}
    />
  ));

  return count === 1 ? skeletonItems[0] : <>{skeletonItems}</>;
}
