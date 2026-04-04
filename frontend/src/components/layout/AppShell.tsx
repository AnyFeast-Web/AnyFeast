import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store/uiStore';
import { motion } from 'framer-motion';

export function AppShell() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 min-w-0"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
