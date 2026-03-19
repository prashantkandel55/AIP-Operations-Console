// src/components/SkeletonLoader.jsx
import React from 'react';

export function SkeletonLoader({ items = 3 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col gap-2">
          <div className="h-3 w-1/3 bg-[var(--bg4)] rounded-[var(--radius)]" />
          <div className="h-2 w-full bg-[var(--bg3)] rounded-[var(--radius)]" />
          <div className="h-2 w-2/3 bg-[var(--bg3)] rounded-[var(--radius)]" />
        </div>
      ))}
    </div>
  );
}
