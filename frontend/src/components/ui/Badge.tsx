import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'amber' | 'rose' | 'blue' | 'purple' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  teal: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  amber: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  rose: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
  blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  gray: 'bg-white/5 text-text-secondary border-border-subtle',
};

export function Badge({ children, variant = 'teal', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-display font-medium border rounded-full',
        variantStyles[variant],
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        className
      )}
    >
      {children}
    </span>
  );
}

// Goal tag badge with predefined colors
export function GoalBadge({ goal }: { goal: string }) {
  const goalMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    fat_loss: { label: 'Fat Loss', variant: 'amber' },
    muscle_gain: { label: 'Muscle Gain', variant: 'teal' },
    maintenance: { label: 'Maintenance', variant: 'blue' },
    diabetic_control: { label: 'Diabetic', variant: 'rose' },
  };

  const config = goalMap[goal] || { label: goal, variant: 'gray' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Status badge
export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Active', variant: 'teal' },
    inactive: { label: 'Inactive', variant: 'gray' },
    draft: { label: 'Draft', variant: 'amber' },
    sent: { label: 'Sent', variant: 'blue' },
    archived: { label: 'Archived', variant: 'gray' },
    expiring: { label: 'Expiring', variant: 'amber' },
  };

  const config = statusMap[status] || { label: status, variant: 'gray' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
