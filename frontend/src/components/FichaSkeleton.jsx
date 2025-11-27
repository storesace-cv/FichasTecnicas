import React from 'react';

export default function FichaSkeleton() {
  return (
    <div className="min-h-screen bg-surface-muted py-8">
      <div className="max-w-6xl mx-auto px-6 space-y-8 animate-pulse">
        <div className="h-4 w-32 bg-[var(--color-neutral-200)] rounded" />
        <div className="h-8 w-64 bg-[var(--color-neutral-200)] rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={`tile-${idx}`} className="bg-surface border border-soft rounded-xl p-4 space-y-3">
              <div className="h-3 w-24 bg-[var(--color-neutral-200)] rounded" />
              <div className="h-5 w-20 bg-[var(--color-neutral-200)] rounded" />
              <div className="h-4 w-32 bg-[var(--color-neutral-100)] rounded" />
            </div>
          ))}
        </div>
        <div className="bg-surface border border-soft rounded-xl p-6 space-y-4">
          <div className="h-5 w-32 bg-[var(--color-neutral-200)] rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, idx) => (
              <div key={`stat-${idx}`} className="h-14 bg-[var(--color-neutral-100)] rounded" />
            ))}
          </div>
          <div className="h-64 bg-[var(--color-neutral-100)] rounded" />
        </div>
      </div>
    </div>
  );
}
