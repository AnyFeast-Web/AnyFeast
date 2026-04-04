import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroDonutProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  size?: number;
}

const COLORS = {
  protein: '#4A9EFF',
  carbs: '#F5A623',
  fat: '#F0506E',
};

export function MacroDonut({ protein, carbs, fat, calories, size = 140 }: MacroDonutProps) {
  const data = [
    { name: 'Protein', value: protein, color: COLORS.protein },
    { name: 'Carbs', value: carbs, color: COLORS.carbs },
    { name: 'Fat', value: fat, color: COLORS.fat },
  ].filter(d => d.value > 0);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.35}
            outerRadius={size * 0.45}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            animationBegin={200}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono-number text-lg text-brand-primary">{Math.round(calories)}</span>
        <span className="text-xs text-text-secondary">kcal</span>
      </div>
    </div>
  );
}
