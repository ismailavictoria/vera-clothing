import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types/product';
import { Button } from './ui';
import { ProductPhoto } from './ProductPhoto';
import { getMainProductImage } from '../lib/productImages';
import { useCart } from '../features/cart/CartContext';
import { useCurrency } from '../features/currency/CurrencyContext';

export function QuickAddDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [error, setError] = useState('');
  const cart = useCart();
  const { formatPrice } = useCurrency();

  const activeVariants = product.variants.filter((v) => v.isActive);

  // All unique sizes/colors from active variants
  const allSizes = [...new Set(activeVariants.map((v) => v.size))].sort();
  const allColors = [...new Map(activeVariants.map((v) => [v.color, { name: v.color, hex: v.hex }])).values()];

  // Currently selected variant (from selectedVariantId)
  const selectedVariant = useMemo(
    () => (selectedVariantId ? product.variants.find((v) => v.id === selectedVariantId) : null),
    [selectedVariantId, product.variants]
  );
  const selectedSize = selectedVariant?.size ?? '';
  const selectedColor = selectedVariant?.color ?? '';

  // Available colors for the currently selected size (or all if no size selected)
  const availableColorsForSize = selectedSize
    ? [...new Map(activeVariants.filter((v) => v.size === selectedSize).map((v) => [v.color, { name: v.color, hex: v.hex }])).values()]
    : allColors;

  // Available sizes for the currently selected color (or all if no color selected)
  const availableSizesForColor = selectedColor
    ? [...new Set(activeVariants.filter((v) => v.color === selectedColor).map((v) => v.size))].sort()
    : allSizes;

  const isSizeAvailable = (size: string) => availableSizesForColor.includes(size);
  const isColorAvailable = (color: string) => availableColorsForSize.some((c) => c.name === color);

  const handleSizeSelect = (size: string) => {
    if (!isSizeAvailable(size)) return;
    let variant = null;
    if (selectedColor) {
      variant = activeVariants.find((v) => v.size === size && v.color === selectedColor);
    } else {
      variant = activeVariants.find((v) => v.size === size);
    }
    setSelectedVariantId(variant?.id ?? '');
    setError('');
  };

  const handleColorSelect = (color: string) => {
    if (!isColorAvailable(color)) return;
    let variant = null;
    if (selectedSize) {
      variant = activeVariants.find((v) => v.color === color && v.size === selectedSize);
    } else {
      variant = activeVariants.find((v) => v.color === color);
    }
    setSelectedVariantId(variant?.id ?? '');
    setError('');
  };

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
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const add = () => {
    if (allSizes.length && !selectedSize) return setError('Please choose a size.');
    if (allColors.length && !selectedColor) return setError('Please choose a color.');
    if (!selectedVariantId) return setError('Select a variant to continue.');
    cart.add({ variantId: selectedVariantId, quantity: 1 });
    onClose();
  };

  const displayPrice = selectedVariant?.priceOverride ?? product.price;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="quick-add-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
        <button className="icon-button dialog-close" onClick={onClose} aria-label="Close options"><X size={19} /></button>
        <ProductPhoto className="quick-add-image" src={getMainProductImage(product.images)} alt={`${product.name} preview`} loading="eager" />
        <div className="quick-add-content">
          <span className="eyebrow">{product.category}</span>
          <h2 id="quick-add-title">{product.name}</h2>
          <p className="price">{formatPrice(displayPrice)}</p>

          {!!allSizes.length && (
            <fieldset className="choice-field">
              <legend>Size <span>Required</span></legend>
              <div className="size-options">
                {allSizes.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`size-option ${selectedSize === option ? 'selected' : ''} ${!isSizeAvailable(option) ? 'unavailable' : ''}`}
                    aria-pressed={selectedSize === option}
                    aria-disabled={!isSizeAvailable(option)}
                    onClick={() => handleSizeSelect(option)}
                    disabled={!isSizeAvailable(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {!!allColors.length && (
            <fieldset className="choice-field">
              <legend>Color <span>{selectedColor || 'Choose a color'}</span></legend>
              <div className="color-options">
                {allColors.map((option) => (
                  <button
                    type="button"
                    key={option.name}
                    className={`color-swatch ${selectedColor === option.name ? 'selected' : ''} ${!isColorAvailable(option.name) ? 'unavailable' : ''}`}
                    style={{ '--swatch': option.hex } as React.CSSProperties}
                    aria-label={option.name}
                    aria-pressed={selectedColor === option.name}
                    aria-disabled={!isColorAvailable(option.name)}
                    onClick={() => handleColorSelect(option.name)}
                    disabled={!isColorAvailable(option.name)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="inline-error" role="alert">{error}</p>}
          <Button fullWidth onClick={add}>Add to bag</Button>
        </div>
      </section>
    </div>
  );
}