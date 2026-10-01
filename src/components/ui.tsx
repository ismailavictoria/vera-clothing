import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', fullWidth, loading, className = '', children, disabled, ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant}${fullWidth ? ' button-full' : ''} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}{children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, id, error, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} {...props} />
      {error && <span className="field-error" id={`${inputId}-error`}>{error}</span>}
    </div>
  );
}
