import { NutritionInfo } from '../../types';
import { MacroDonut } from './MacroDonut';
import { MacroBar } from './MacroBar';
import { formatCalories, formatMacro } from '../../utils/formatters';

interface NutritionPanelProps {
  nutrition: NutritionInfo;
  goals?: NutritionInfo;
  title?: string;
}

export function NutritionPanel({ nutrition, goals, title = 'Nutrition Summary' }: NutritionPanelProps) {
  const macros = [
    { label: 'Protein', value: nutrition.protein_g, goal: goals?.protein_g, color: 'bg-macro-protein', textColor: 'text-macro-protein' },
    { label: 'Carbs', value: nutrition.carbs_g, goal: goals?.carbs_g, color: 'bg-macro-carbs', textColor: 'text-macro-carbs' },
    { label: 'Fat', value: nutrition.fat_g, goal: goals?.fat_g, color: 'bg-macro-fat', textColor: 'text-macro-fat' },
    { label: 'Fiber', value: nutrition.fiber_g, goal: goals?.fiber_g, color: 'bg-macro-fiber', textColor: 'text-macro-fiber' },
  ];

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
      <h3 className="text-md font-display font-semibold text-text-primary mb-4">{title}</h3>

      {/* Donut Chart */}
      <div className="flex justify-center mb-5">
        <MacroDonut
          protein={nutrition.protein_g}
          carbs={nutrition.carbs_g}
          fat={nutrition.fat_g}
          calories={nutrition.calories}
        />
      </div>

      {/* Macro Bar */}
      <MacroBar
        protein={nutrition.protein_g}
        carbs={nutrition.carbs_g}
        fat={nutrition.fat_g}
        className="mb-5"
      />

      {/* Macro Details */}
      <div className="space-y-3">
        {macros.map((macro) => (
          <div key={macro.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-secondary">{macro.label}</span>
              <span className={`text-sm font-mono ${macro.textColor}`}>
                {formatMacro(macro.value)}
                {macro.goal && (
                  <span className="text-text-muted"> / {formatMacro(macro.goal)}</span>
                )}
              </span>
            </div>
            {macro.goal && (
              <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${macro.color} transition-all duration-500`}
                  style={{ width: `${Math.min((macro.value / macro.goal) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Calories */}
      <div className="mt-5 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-sm font-display font-medium text-text-secondary">Total Calories</span>
          <span className="mono-number text-xl text-brand-primary">
            {formatCalories(nutrition.calories)}
          </span>
        </div>
      </div>
    </div>
  );
}
