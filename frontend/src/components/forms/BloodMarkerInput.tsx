import { clsx } from 'clsx';
import { Plus, Trash2 } from 'lucide-react';
import type { BloodMarkerEntry } from '../../types/consultationForm.types';

const COMMON_MARKERS = [
  { name: 'HbA1c', unit: '%', range: '4.0–5.6' },
  { name: 'Fasting Glucose', unit: 'mg/dL', range: '70–100' },
  { name: 'Total Cholesterol', unit: 'mg/dL', range: '<200' },
  { name: 'LDL', unit: 'mg/dL', range: '<100' },
  { name: 'HDL', unit: 'mg/dL', range: '>40' },
  { name: 'Triglycerides', unit: 'mg/dL', range: '<150' },
  { name: 'Vitamin D', unit: 'ng/mL', range: '30–100' },
  { name: 'Vitamin B12', unit: 'pg/mL', range: '200–900' },
  { name: 'Iron (Serum)', unit: 'µg/dL', range: '60–170' },
  { name: 'Ferritin', unit: 'ng/mL', range: '12–300' },
  { name: 'TSH', unit: 'mIU/L', range: '0.4–4.0' },
  { name: 'T3', unit: 'ng/dL', range: '80–200' },
  { name: 'T4', unit: 'µg/dL', range: '5.0–12.0' },
  { name: 'SGOT (AST)', unit: 'U/L', range: '10–40' },
  { name: 'SGPT (ALT)', unit: 'U/L', range: '7–56' },
  { name: 'Creatinine', unit: 'mg/dL', range: '0.7–1.3' },
  { name: 'Uric Acid', unit: 'mg/dL', range: '3.5–7.2' },
  { name: 'Hemoglobin', unit: 'g/dL', range: '12–17' },
];

interface BloodMarkerInputProps {
  markers: BloodMarkerEntry[];
  onChange: (markers: BloodMarkerEntry[]) => void;
}

const STATUS_STYLES = {
  normal: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  low: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
  high: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
  critical: 'bg-accent-rose/10 text-accent-rose border-accent-rose/30',
  '': 'bg-bg-input text-text-muted border-border-subtle',
};

export function BloodMarkerInput({ markers, onChange }: BloodMarkerInputProps) {
  const addMarker = (preset?: typeof COMMON_MARKERS[0]) => {
    const newMarker: BloodMarkerEntry = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      marker_name: preset?.name ?? '',
      value: '',
      unit: preset?.unit ?? '',
      reference_range: preset?.range ?? '',
      status: '',
    };
    onChange([...markers, newMarker]);
  };

  const updateMarker = (id: string, field: keyof BloodMarkerEntry, value: string) => {
    onChange(
      markers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeMarker = (id: string) => {
    onChange(markers.filter((m) => m.id !== id));
  };

  const unusedPresets = COMMON_MARKERS.filter(
    (p) => !markers.find((m) => m.marker_name === p.name)
  );

  return (
    <div className="space-y-4">
      {/* Quick-add presets */}
      {unusedPresets.length > 0 && (
        <div>
          <p className="text-xs text-text-muted mb-2 font-display font-medium">Quick add common markers:</p>
          <div className="flex flex-wrap gap-1.5">
            {unusedPresets.slice(0, 12).map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => addMarker(preset)}
                className="px-2.5 py-1 text-xs rounded-full bg-bg-input border border-border-subtle text-text-secondary hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all duration-200"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Markers table */}
      {markers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left text-xs font-display font-medium text-text-secondary px-3 py-2 rounded-l-md">Marker</th>
                <th className="text-left text-xs font-display font-medium text-text-secondary px-3 py-2">Value</th>
                <th className="text-left text-xs font-display font-medium text-text-secondary px-3 py-2">Unit</th>
                <th className="text-left text-xs font-display font-medium text-text-secondary px-3 py-2">Ref. Range</th>
                <th className="text-left text-xs font-display font-medium text-text-secondary px-3 py-2">Status</th>
                <th className="text-left text-xs font-display font-medium text-text-secondary px-3 py-2 rounded-r-md w-10"></th>
              </tr>
            </thead>
            <tbody>
              {markers.map((marker) => (
                <tr key={marker.id} className="border-b border-border-subtle group">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={marker.marker_name}
                      onChange={(e) => updateMarker(marker.id, 'marker_name', e.target.value)}
                      placeholder="Marker name"
                      className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={marker.value}
                      onChange={(e) => updateMarker(marker.id, 'value', e.target.value)}
                      placeholder="—"
                      className="w-20 bg-bg-input border border-border-subtle rounded px-2 py-1 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={marker.unit}
                      onChange={(e) => updateMarker(marker.id, 'unit', e.target.value)}
                      placeholder="unit"
                      className="w-16 bg-transparent text-xs text-text-muted focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted">{marker.reference_range || '—'}</td>
                  <td className="px-3 py-2">
                    <select
                      value={marker.status}
                      onChange={(e) => updateMarker(marker.id, 'status', e.target.value)}
                      className={clsx(
                        'text-xs px-2 py-1 rounded-full border font-medium cursor-pointer focus:outline-none',
                        STATUS_STYLES[marker.status || '']
                      )}
                    >
                      <option value="">—</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeMarker(marker.id)}
                      className="p-1 rounded text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add custom marker */}
      <button
        type="button"
        onClick={() => addMarker()}
        className="flex items-center gap-2 text-sm text-brand-primary hover:text-brand-dim font-medium transition-colors"
      >
        <Plus className="w-4 h-4" /> Add custom marker
      </button>
    </div>
  );
}
