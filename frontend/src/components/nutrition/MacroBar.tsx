import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface MacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
  showLabels?: boolean;
  height?: number;
  className?: string;
}

export function MacroBar({ protein, carbs, fat, showLabels = true, height = 8, className }: MacroBarProps) {
  const total = protein + carbs + fat;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (total === 0) return null;

  const proteinPct = (protein / total) * 100;
  const carbsPct = (carbs / total) * 100;
  const fatPct = (fat / total) * 100;

  return (
    <div className={clsx('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-mono text-macro-protein">P {Math.round(proteinPct)}%</span>
          <span className="text-xs font-mono text-macro-carbs">C {Math.round(carbsPct)}%</span>
          <span className="text-xs font-mono text-macro-fat">F {Math.round(fatPct)}%</span>
        </div>
      )}
      <div
        className="w-full bg-bg-elevated rounded-full overflow-hidden flex"
        style={{ height }}
      >
        <div
          className="bg-macro-protein transition-all duration-[600ms] ease-out rounded-l-full"
          style={{ width: animated ? `${proteinPct}%` : '0%' }}
        />
        <div
          className="bg-macro-carbs transition-all duration-[600ms] ease-out"
          style={{
            width: animated ? `${carbsPct}%` : '0%',
            transitionDelay: '100ms',
          }}
        />
        <div
          className="bg-macro-fat transition-all duration-[600ms] ease-out rounded-r-full"
          style={{
            width: animated ? `${fatPct}%` : '0%',
            transitionDelay: '200ms',
          }}
        />
      </div>
    </div>
  );
}
