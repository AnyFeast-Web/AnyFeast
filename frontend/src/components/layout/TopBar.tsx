import { BellRing, Search } from 'lucide-react';
import { Input } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-72">
            <Input
              variant="search"
              placeholder="Search clients, plans, ingredients..."
              className="!py-2"
            />
          </div>

          {actions}

          <button className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
            <BellRing className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full" />
          </button>

          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-border-subtle">
            <Avatar name={user?.name || 'User'} size="sm" active />
            <div>
              <p className="text-sm font-display font-medium text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
