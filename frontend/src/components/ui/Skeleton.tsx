import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const baseStyles = 'animate-shimmer rounded';

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-16 h-6" variant="rectangular" />
      </div>
      <Skeleton className="w-24 h-8" />
      <Skeleton className="w-full h-3" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border-subtle">
      <Skeleton variant="circular" className="w-10 h-10" />
      <Skeleton className="w-32 h-4" />
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-20 h-6" variant="rectangular" />
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-16 h-6" variant="rectangular" />
    </div>
  );
}
