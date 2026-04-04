import { History, User, Clock } from 'lucide-react';
import type { FullConsultationForm } from '../../types/consultationForm.types';
import { motion } from 'framer-motion';

interface AuditTrailPanelProps {
  form: FullConsultationForm;
}

export function AuditTrailPanel({ form }: AuditTrailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-3 pt-4 border-t border-border-subtle"
    >
      <div className="flex items-center gap-2 px-1">
        <History className="w-4 h-4 text-text-muted" />
        <p className="text-xs font-display font-semibold text-text-secondary uppercase">
          Audit Trail
        </p>
      </div>

      <div className="space-y-2 px-2">
        <div className="text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary mb-0.5">
            <User className="w-3.5 h-3.5" />
            <span>Created By</span>
          </div>
          <p className="text-text-primary font-medium pl-5">{form.nutritionist_name}</p>
        </div>

        <div className="text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Created At</span>
          </div>
          <p className="text-text-primary pl-5">
            {new Date(form.created_at).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <div className="text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Modified</span>
          </div>
          <p className="text-text-primary pl-5">
            {new Date(form.updated_at).toLocaleString('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
