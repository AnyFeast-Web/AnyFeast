import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  isComplete?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  icon,
  isComplete = false,
  defaultOpen = true,
  children,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-bg-elevated/50 transition-colors text-left"
      >
        {icon && <div className="text-brand-primary flex-shrink-0">{icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-display font-semibold text-text-primary">{title}</h3>
            {isComplete && <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />}
          </div>
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-5 pb-5 space-y-4 border-t border-border-subtle pt-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
