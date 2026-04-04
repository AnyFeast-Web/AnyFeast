import { clsx } from 'clsx';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: string;
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveIndicatorProps) {
  const configs = {
    idle: {
      icon: <Cloud className="w-3.5 h-3.5" />,
      text: 'Draft',
      className: 'text-text-muted',
    },
    saving: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      text: 'Saving...',
      className: 'text-accent-amber',
    },
    saved: {
      icon: <Check className="w-3.5 h-3.5" />,
      text: lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved',
      className: 'text-brand-primary',
    },
    error: {
      icon: <CloudOff className="w-3.5 h-3.5" />,
      text: 'Save failed',
      className: 'text-accent-rose',
    },
  };

  const { icon, text, className } = configs[status];

  return (
    <div className={clsx('flex items-center gap-1.5 text-xs font-display font-medium', className)}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
