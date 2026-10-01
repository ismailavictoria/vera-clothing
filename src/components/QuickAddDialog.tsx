import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types/product';
import { Button } from './ui';
import { ProductPhoto } from './ProductPhoto';
import { getMainProductImage } from '../lib/productImages';
import { useCart } from '../features/cart/CartContext';
import { useCurrency } from '../features/currency/CurrencyContext';

export function QuickAddDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');
  const cart = useCart();
  const { formatPrice } = useCurrency();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled])');
    focusable?.[1]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog) return;
      const items = dialog.querySelectorAll<HTMLElement>('button:not([disabled])');
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); previousFocus?.focus(); };
  }, [onClose]);
  const add = () => {
    if (product.availableSizes.length && !size) return setError('Please choose a size.');
    if (product.availableColors.length && !color) return setError('Please choose a color.');
    cart.add({ productId: product.id, size: size || 'One size', color: color || 'Default' });
    onClose();
  };
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="quick-add-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Close options"><X size={19} /></button>
        <ProductPhoto className="quick-add-image" src={getMainProductImage(product.images)} alt={`${product.name} preview`} loading="eager" />
        <div className="quick-add-content"><span className="eyebrow">{product.category}</span><h2 id="quick-add-title">{product.name}</h2><p className="price">{formatPrice(product.price)}</p>
          {!!product.availableSizes.length && <fieldset className="choice-field"><legend>Size <span>Required</span></legend><div className="size-options">{product.availableSizes.map((option) => <button type="button" key={option} className={`size-option ${size === option ? 'selected' : ''}`} aria-pressed={size === option} onClick={() => { setSize(option); setError(''); }}>{option}</button>)}</div></fieldset>}
          {!!product.availableColors.length && <fieldset className="choice-field"><legend>Color <span>{color || 'Choose a color'}</span></legend><div className="color-options">{product.availableColors.map((option) => <button type="button" key={option.name} className={`color-swatch ${color === option.name ? 'selected' : ''}`} style={{ '--swatch': option.hex } as React.CSSProperties} aria-label={option.name} aria-pressed={color === option.name} onClick={() => { setColor(option.name); setError(''); }} />)}</div></fieldset>}
          {error && <p className="inline-error" role="alert">{error}</p>}<Button fullWidth onClick={add}>Add to bag</Button>
        </div>
      </section>
    </div>
  );
}
