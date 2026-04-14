import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Database,
  MessageSquare,
  Zap,
  Settings2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { APP_NAME } from '../../utils/constants';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/meal-plans', label: 'Diet Plans', icon: CalendarDays },
  { path: '/consultations', label: 'Consultations', icon: MessageSquare },
  { path: '/automation', label: 'Automation', icon: Zap },
  { path: '/settings', label: 'Settings', icon: Settings2 },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 h-screen bg-bg-surface border-r border-border-subtle flex flex-col z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-subtle">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="AnyFeast" className="w-full h-full object-contain" />
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-lg text-text-primary whitespace-nowrap"
          >
            {APP_NAME}
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative',
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-primary rounded-r-full"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-brand-primary')} />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-display font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Section */}
      <div className="border-t border-border-subtle p-3">
        <div className={clsx('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <Avatar name={user?.name || 'User'} size="sm" active />
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-display font-medium text-text-primary truncate">
                {user?.name}
              </p>
              <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
            </motion.div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
