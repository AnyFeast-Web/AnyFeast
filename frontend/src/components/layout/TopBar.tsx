import { useState, useRef, useEffect } from 'react';
import { BellRing, Search, X, User, CalendarDays } from 'lucide-react';
import { Input } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { useMealPlans } from '../../hooks/useMealPlans';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, subtitle, actions, className }: TopBarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: clients = [] } = useClients();
  const { data: plans = [] } = useMealPlans();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter((c: any) => 
    `${c.personal_info?.first_name} ${c.personal_info?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlans = plans.filter((p: any) => 
    (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (p.client_name && p.client_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <header className={`sticky top-0 z-30 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle px-8 py-4 print:hidden ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-72 relative" ref={searchRef}>
            <Input
              variant="search"
              placeholder="Search clients, plans..."
              className="!py-2"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full mt-2 w-full bg-bg-surface border border-border-subtle rounded-lg shadow-xl overflow-hidden py-2 max-h-96 overflow-y-auto z-50">
                {filteredClients.length === 0 && filteredPlans.length === 0 ? (
                  <p className="text-sm text-text-secondary px-4 py-3">No results found.</p>
                ) : (
                  <>
                    {filteredClients.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Clients</div>
                        {filteredClients.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              navigate(`/clients/${c.id}`);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-bg-elevated transition-colors flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-brand-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-text-primary truncate">{c.personal_info?.first_name} {c.personal_info?.last_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredPlans.length > 0 && (
                      <div className="pb-1">
                        <div className="px-3 py-1 text-xs font-semibold text-text-muted uppercase tracking-wider">Meal Plans</div>
                        {filteredPlans.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              navigate(`/meal-plans/${p.id}`);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-bg-elevated transition-colors flex flex-col justify-center"
                          >
                            <div className="flex items-center gap-2 truncate w-full">
                              <CalendarDays className="w-4 h-4 text-accent-amber flex-shrink-0" />
                              <span className="text-sm font-medium text-text-primary truncate">{p.title}</span>
                            </div>
                            {p.client_name && <span className="text-xs text-text-muted mt-0.5 ml-6 truncate block">{p.client_name}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
