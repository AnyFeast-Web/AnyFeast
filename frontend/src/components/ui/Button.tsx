import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-display font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-primary text-text-inverse hover:bg-brand-dim hover:-translate-y-[1px] active:translate-y-0',
    secondary: 'bg-transparent border border-border-strong text-text-primary hover:bg-bg-elevated',
    danger: 'bg-accent-rose/10 border border-accent-rose/30 text-accent-rose hover:bg-accent-rose/20',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-sm',
    md: 'text-sm px-5 py-2.5 rounded-md',
    lg: 'text-base px-6 py-3 rounded-md',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
