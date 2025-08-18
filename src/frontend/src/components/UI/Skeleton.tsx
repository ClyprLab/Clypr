import React from 'react';

type SkeletonProps = {
  lines?: number;
  height?: string;
  className?: string;
};

export default function Skeleton({ lines = 3, height = 'h-4', className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-neutral-800 rounded-md animate-pulse w-full`}
          style={{ transformOrigin: 'left top' }}
        />
      ))}
    </div>
  );
}
