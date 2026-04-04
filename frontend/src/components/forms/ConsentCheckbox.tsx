import { clsx } from 'clsx';
import { Check, ShieldCheck } from 'lucide-react';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  timestamp?: string;
}

export function ConsentCheckbox({ checked, onChange, timestamp }: ConsentCheckboxProps) {
  return (
    <div className={clsx(
      'flex items-start gap-3 p-4 rounded-lg border transition-all duration-200',
      checked
        ? 'bg-brand-primary/5 border-brand-primary/30'
        : 'bg-accent-amber/5 border-accent-amber/30'
    )}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200',
          checked
            ? 'bg-brand-primary shadow-sm'
            : 'border-2 border-border-strong bg-bg-elevated hover:border-brand-primary'
        )}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className={clsx('w-4 h-4', checked ? 'text-brand-primary' : 'text-accent-amber')} />
          <p className="text-sm font-display font-semibold text-text-primary">Medical Data Consent</p>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          I confirm I have obtained the client's informed consent to collect, store, and process their medical and health 
          information in accordance with data protection regulations (GDPR). The client understands how their data will be used.
        </p>
        {checked && timestamp && (
          <p className="text-xs text-brand-primary mt-2 font-medium">
            ✓ Consent recorded at {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
