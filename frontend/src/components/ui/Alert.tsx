import { clsx } from 'clsx';
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AlertProps {
  variant?: 'warning' | 'error' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const alertConfig = {
  warning: {
    border: 'border-l-accent-amber',
    icon: <AlertTriangle className="w-5 h-5 text-accent-amber" />,
    titleColor: 'text-accent-amber',
  },
  error: {
    border: 'border-l-accent-rose',
    icon: <AlertCircle className="w-5 h-5 text-accent-rose" />,
    titleColor: 'text-accent-rose',
  },
  success: {
    border: 'border-l-brand-primary',
    icon: <CheckCircle2 className="w-5 h-5 text-brand-primary" />,
    titleColor: 'text-brand-primary',
  },
  info: {
    border: 'border-l-accent-blue',
    icon: <Info className="w-5 h-5 text-accent-blue" />,
    titleColor: 'text-accent-blue',
  },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const config = alertConfig[variant];

  return (
    <div
      className={clsx(
        'bg-bg-surface border border-border-subtle rounded-md p-4 border-l-4',
        config.border,
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <div>
          {title && (
            <p className={clsx('text-sm font-display font-semibold mb-1', config.titleColor)}>
              {title}
            </p>
          )}
          <div className="text-sm text-text-secondary">{children}</div>
        </div>
      </div>
    </div>
  );
}
