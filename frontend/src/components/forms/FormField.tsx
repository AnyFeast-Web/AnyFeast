import React from 'react';
import { clsx } from 'clsx';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      <label className="flex items-center gap-1 text-sm font-display font-medium text-text-secondary">
        {label}
        {required && <span className="text-accent-rose">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && <p className="text-xs text-accent-rose">{error}</p>}
    </div>
  );
}

/* ── Textarea ── */
interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, required, error, hint, className, ...props }: TextAreaFieldProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <textarea
        className={clsx(
          'w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5',
          'text-sm font-body text-text-primary placeholder:text-text-muted',
          'focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(22,163,74,0.15)] focus:outline-none',
          'transition-all duration-200 resize-none min-h-[80px]',
          error && 'border-accent-rose',
          className
        )}
        {...props}
      />
    </FormField>
  );
}

/* ── Select ── */
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({ label, required, error, options, placeholder, className, ...props }: SelectFieldProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <select
        className={clsx(
          'w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5',
          'text-sm font-body text-text-primary',
          'focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(22,163,74,0.15)] focus:outline-none',
          'transition-all duration-200 appearance-none cursor-pointer',
          'bg-[url("data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3e%3cpath%20stroke=%27%2364748b%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27M6%208l4%204%204-4%27/%3e%3c/svg%3e")] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8',
          error && 'border-accent-rose',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FormField>
  );
}

/* ── Number Input ── */
interface NumberFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  value: number | null;
  onChange: (val: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function NumberField({ label, required, error, value, onChange, placeholder, min, max, step, unit }: NumberFieldProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={clsx(
            'w-full bg-bg-input border border-border-subtle rounded-md px-3.5 py-2.5',
            'text-sm font-body text-text-primary placeholder:text-text-muted',
            'focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(22,163,74,0.15)] focus:outline-none',
            'transition-all duration-200',
            unit && 'pr-12',
            error && 'border-accent-rose'
          )}
        />
        {unit && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted font-medium">
            {unit}
          </span>
        )}
      </div>
    </FormField>
  );
}
