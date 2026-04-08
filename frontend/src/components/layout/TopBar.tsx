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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Upcoming Consultation', time: 'In 30 mins', type: 'urgent' },
    { id: 2, title: 'New Meal Plan Created', time: '2 hours ago', type: 'info' },
  ]);

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

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <BellRing className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-bg-surface border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-elevated/50">
                  <h3 className="text-sm font-display font-semibold text-text-primary">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-text-muted" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-border-subtle last:border-0 hover:bg-bg-elevated/30 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          {notif.type === 'urgent' && <span className="w-2 h-2 rounded-full bg-accent-rose animate-pulse" />}
                          <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                        </div>
                        <p className="text-xs text-text-muted">{notif.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm text-text-muted italic">No new notifications</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 bg-bg-elevated/20 text-center">
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-xs font-medium text-brand-primary hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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
