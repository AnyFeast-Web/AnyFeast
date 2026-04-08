import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return format(parseISO(dateStr), 'MMM dd, yyyy · h:mm a');
  } catch (e) {
    return 'Invalid Date';
  }
}

export function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return 'some time ago';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch (e) {
    return 'unknown time';
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatWeight(kg: number | undefined | null): string {
  if (!kg) return 'N/A';
  return `${kg} kg`;
}

export function formatHeight(cm: number | undefined | null): string {
  if (!cm) return 'N/A';
  return `${cm} cm`;
}

export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`;
}

export function formatMacro(grams: number, unit = 'g'): string {
  return `${Math.round(grams)}${unit}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    fat_loss: 'Fat Loss',
    muscle_gain: 'Muscle Gain',
    maintenance: 'Maintenance',
    diabetic_control: 'Diabetic Control',
  };
  return labels[goal] || goal;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-brand-primary',
    inactive: 'text-text-secondary',
    draft: 'text-accent-amber',
    sent: 'text-accent-blue',
    archived: 'text-text-muted',
  };
  return colors[status] || 'text-text-secondary';
}
