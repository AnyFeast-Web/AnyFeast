import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={clsx('px-8 py-6 max-w-[1200px]', className)}
    >
      {children}
    </motion.div>
  );
}
