import { clsx } from 'clsx';
import { Plus, Trash2, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import { useState } from 'react';
import type { SupplementEntry } from '../../types/consultationForm.types';

interface SupplementRowProps {
  supplements: SupplementEntry[];
  onChange: (supplements: SupplementEntry[]) => void;
}

function SingleSupplement({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: SupplementEntry;
  onUpdate: (field: keyof SupplementEntry, value: string | boolean) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-bg-elevated">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface">
        <div className="w-8 h-8 rounded-md bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
          <Pill className="w-4 h-4 text-accent-purple" />
        </div>
        <input
          type="text"
          value={entry.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder="Supplement name..."
          className="flex-1 bg-transparent text-sm font-display font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onUpdate('is_current', !entry.is_current)}
          className={clsx(
            'px-2.5 py-1 text-xs rounded-full font-medium border transition-all',
            entry.is_current
              ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
              : 'bg-bg-input text-text-muted border-border-subtle'
          )}
        >
          {entry.is_current ? 'Current' : 'Past'}
        </button>
        <button type="button" onClick={() => setExpanded(!expanded)} className="p-1 text-text-muted hover:text-text-primary transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-text-muted hover:text-accent-rose transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Details */}
      {expanded && (
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          {[
            { key: 'brand', label: 'Brand', placeholder: 'e.g. NOW Foods' },
            { key: 'dosage', label: 'Dosage', placeholder: 'e.g. 1000 IU' },
            { key: 'frequency', label: 'Frequency', placeholder: 'e.g. Once daily' },
            { key: 'duration', label: 'Duration', placeholder: 'e.g. 3 months' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-display font-medium text-text-muted">{label}</label>
              <input
                type="text"
                value={entry[key as keyof SupplementEntry] as string}
                onChange={(e) => onUpdate(key as keyof SupplementEntry, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-colors"
              />
            </div>
          ))}
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-display font-medium text-text-muted">Reason for taking</label>
            <input
              type="text"
              value={entry.reason}
              onChange={(e) => onUpdate('reason', e.target.value)}
              placeholder="e.g. Vitamin D deficiency"
              className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-display font-medium text-text-muted">Side effects / outcomes</label>
            <input
              type="text"
              value={entry.side_effects}
              onChange={(e) => onUpdate('side_effects', e.target.value)}
              placeholder="Any side effects or notable outcomes..."
              className="w-full bg-bg-input border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function SupplementRow({ supplements, onChange }: SupplementRowProps) {
  const addSupplement = () => {
    const entry: SupplementEntry = {
      id: `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      brand: '',
      dosage: '',
      frequency: '',
      duration: '',
      reason: '',
      side_effects: '',
      is_current: true,
    };
    onChange([...supplements, entry]);
  };

  const updateSupplement = (id: string, field: keyof SupplementEntry, value: string | boolean) => {
    onChange(
      supplements.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSupplement = (id: string) => {
    onChange(supplements.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-3">
      {supplements.map((entry) => (
        <SingleSupplement
          key={entry.id}
          entry={entry}
          onUpdate={(field, value) => updateSupplement(entry.id, field, value)}
          onRemove={() => removeSupplement(entry.id)}
        />
      ))}

      <button
        type="button"
        onClick={addSupplement}
        className="flex items-center gap-2 text-sm text-brand-primary hover:text-brand-dim font-medium transition-colors"
      >
        <Plus className="w-4 h-4" /> Add supplement
      </button>
    </div>
  );
}
