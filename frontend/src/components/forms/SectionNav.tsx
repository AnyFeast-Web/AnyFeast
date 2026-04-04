import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import type { ConsultationFormSection, SectionMeta } from '../../types/consultationForm.types';

interface SectionNavProps {
  sections: SectionMeta[];
  activeSection: ConsultationFormSection;
  onSelect: (section: ConsultationFormSection) => void;
  completionMap: Record<string, boolean>;
}

export function SectionNav({ sections, activeSection, onSelect, completionMap }: SectionNavProps) {
  return (
    <nav className="space-y-1">
      {sections.map((section, index) => {
        const isActive = activeSection === section.id;
        const isComplete = completionMap[section.id] ?? false;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group',
              isActive
                ? 'bg-brand-primary/10 border border-brand-primary/20'
                : 'hover:bg-bg-elevated border border-transparent'
            )}
          >
            {/* Section badge */}
            <div
              className={clsx(
                'w-7 h-7 rounded-md flex items-center justify-center text-xs font-display font-bold flex-shrink-0 transition-all',
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : isComplete
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'bg-bg-input text-text-muted group-hover:text-text-secondary'
              )}
            >
              {section.shortLabel}
            </div>

            {/* Label + description */}
            <div className="flex-1 min-w-0">
              <p
                className={clsx(
                  'text-sm font-display font-medium truncate transition-colors',
                  isActive ? 'text-brand-primary' : 'text-text-primary'
                )}
              >
                {section.label}
              </p>
              <p className="text-xs text-text-muted truncate">{section.description}</p>
            </div>

            {/* Completion indicator */}
            {isComplete && (
              <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
