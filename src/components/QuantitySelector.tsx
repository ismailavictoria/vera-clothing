import { Minus, Plus } from 'lucide-react';

export function QuantitySelector({ value, onChange, label = 'Quantity' }: { value: number; onChange: (value: number) => void; label?: string }) {
  return (
    <div className="quantity-control" aria-label={label}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}><Minus size={14} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}><Plus size={14} /></button>
    </div>
  );
}
