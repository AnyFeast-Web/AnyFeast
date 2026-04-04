import { clsx } from 'clsx';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const gradients = [
  'from-brand-primary/60 to-accent-blue/60',
  'from-accent-purple/60 to-accent-rose/60',
  'from-accent-amber/60 to-accent-rose/60',
  'from-accent-blue/60 to-accent-purple/60',
  'from-brand-primary/60 to-accent-purple/60',
];

function getGradient(name: string): string {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function Avatar({ name, src, size = 'md', active = false, className }: AvatarProps) {
  return (
    <div className={clsx('relative inline-flex', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={clsx(
            'rounded-full object-cover',
            sizeStyles[size]
          )}
        />
      ) : (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-display font-semibold text-white bg-gradient-to-br',
            sizeStyles[size],
            getGradient(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {active && (
        <>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-primary rounded-full border-2 border-bg-surface" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-primary rounded-full animate-pulse-ring" />
        </>
      )}
    </div>
  );
}
