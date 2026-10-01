import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({ value, onChange, label = 'Quantity', max }: { value: number; onChange: (value: number) => void; label?: string; max?: number }) {
  return (
    <div className="quantity-control" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}><Minus size={14} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min((max ?? Infinity), value + 1))} disabled={max !== undefined && value >= max}><Plus size={14} /></button>
    </div>
  );
}
