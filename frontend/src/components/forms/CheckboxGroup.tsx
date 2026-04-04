import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: 2 | 3 | 4;
}

export function CheckboxGroup({ label, options, selected, onChange, columns = 2 }: CheckboxGroupProps) {
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    );
  };

  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-display font-medium text-text-secondary">{label}</p>
      <div className={clsx('grid gap-2', colsClass[columns])}>
        {options.map((option) => {
          const isChecked = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-body transition-all duration-200 text-left',
                isChecked
                  ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary'
                  : 'bg-bg-input border border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
              )}
            >
              <div
                className={clsx(
                  'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isChecked
                    ? 'bg-brand-primary'
                    : 'border border-border-strong bg-bg-elevated'
                )}
              >
                {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="truncate">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
