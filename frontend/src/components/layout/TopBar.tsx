import { useState } from 'react';
import { BellRing, Search, X } from 'lucide-react';
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

          <button 
            onClick={() => window.location.href = '/settings'}
            className="hidden lg:flex items-center gap-3 pl-4 border-l border-border-subtle hover:bg-bg-elevated transition-colors rounded-r-lg py-1 pr-2"
          >
            <Avatar name={user?.name || 'User'} size="sm" active />
            <div className="text-left">
              <p className="text-sm font-display font-medium text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
