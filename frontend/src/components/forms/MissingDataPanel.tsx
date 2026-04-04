import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import type { MissingDataFlag } from '../../utils/consultationUtils';

interface MissingDataPanelProps {
  flags: MissingDataFlag[];
  onNavigate: (sectionId: string) => void;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    className: 'bg-accent-rose/5 border-accent-rose/20 text-accent-rose',
    dotClass: 'bg-accent-rose',
    label: 'Critical',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-accent-amber/5 border-accent-amber/20 text-accent-amber',
    dotClass: 'bg-accent-amber',
    label: 'Warning',
  },
  info: {
    icon: Info,
    className: 'bg-accent-blue/5 border-accent-blue/20 text-accent-blue',
    dotClass: 'bg-accent-blue',
    label: 'Info',
  },
};

export function MissingDataPanel({ flags, onNavigate }: MissingDataPanelProps) {
  if (flags.length === 0) return null;

  const critical = flags.filter((f) => f.severity === 'critical');
  const warning = flags.filter((f) => f.severity === 'warning');
  const info = flags.filter((f) => f.severity === 'info');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-display font-semibold text-text-secondary uppercase">
          Missing Data ({flags.length})
        </p>
        <div className="flex items-center gap-2">
          {critical.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-accent-rose font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              {critical.length}
            </span>
          )}
          {warning.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-accent-amber font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
              {warning.length}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {[...critical, ...warning, ...info].map((flag, i) => {
          const config = SEVERITY_CONFIG[flag.severity];
          const Icon = config.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onNavigate(flag.sectionId)}
              className={`w-full flex items-start gap-2 px-3 py-2 rounded-md border text-left transition-all hover:shadow-sm group ${config.className}`}
            >
              <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary font-medium truncate">{flag.message}</p>
                <p className="text-xs opacity-70">{flag.section}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0 text-text-muted" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
