import React from 'react';
import { clsx } from 'clsx';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'search';
}

export function Input({
  label,
  error,
  icon,
  variant = 'default',
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-display font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {(icon || variant === 'search') && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            {icon || <Search className="w-4 h-4" />}
          </div>
        )}
        <input
          className={clsx(
            'w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5',
            'text-sm font-body text-text-primary placeholder:text-text-muted',
            'focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(0,212,161,0.15)] focus:outline-none',
            'transition-all duration-200',
            (icon || variant === 'search') && 'pl-10',
            error && 'border-accent-rose focus:border-accent-rose focus:shadow-[0_0_0_3px_rgba(240,80,110,0.15)]',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-rose">{error}</p>}
    </div>
  );
}
