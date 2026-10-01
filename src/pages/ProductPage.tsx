import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { useCatalog } from '../features/catalog/CatalogContext';
import { useCart } from '../features/cart/CartContext';
import { useCurrency } from '../features/currency/CurrencyContext';
import { brand } from '../config/brand';
import { ProductGrid } from '../components/ProductGrid';
import { WishlistButton } from '../components/WishlistButton';
import { Button } from '../components/ui';
import { ProductPhoto } from '../components/ProductPhoto';
import { MAX_PRODUCT_IMAGES } from '../lib/productImages';

export function ProductPage() {
  const { formatPrice } = useCurrency();
  const { products } = useCatalog();
  const { productId } = useParams();
  const product = products.find((entry) => entry.id === productId);
  const cart = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const related = useMemo(
    () => (product ? products.filter((entry) => entry.category === product.category && entry.id !== product.id).slice(0, 4) : []),
    [product]
  );

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariantId('');
  }, [productId]);

  if (!product) {
    return (
      <div className="page-wrap">
        <div className="empty-state">
          <span className="eyebrow">A little detour</span>
          <h1>We couldn't find that piece.</h1>
          <Link className="button button-primary" to="/shop">Back to the collection</Link>
        </div>
      </div>
    );
  }

  const images = product.images.slice(0, MAX_PRODUCT_IMAGES);
  const activeImageIndex = Math.min(selectedImageIndex, Math.max(0, images.length - 1));

  const activeVariants = product.variants.filter((v) => v.isActive);

  // All unique sizes/colors from active variants
  const allSizes = [...new Set(activeVariants.map((v) => v.size))].sort();
  const allColors = [...new Map(activeVariants.map((v) => [v.color, { name: v.color, hex: v.hex }])).values()];

  // Currently selected variant (from selectedVariantId)
  const selectedVariant = selectedVariantId ? product.variants.find((v) => v.id === selectedVariantId) : null;
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
    // Find a variant with this size and the currently selected color (if any)
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
    // Find a variant with this color and the currently selected size (if any)
    let variant = null;
    if (selectedSize) {
      variant = activeVariants.find((v) => v.color === color && v.size === selectedSize);
    } else {
      variant = activeVariants.find((v) => v.color === color);
    }
    setSelectedVariantId(variant?.id ?? '');
    setError('');
  };

  const addToBag = () => {
    if (allSizes.length && !selectedSize) return setError('Choose your size to continue.');
    if (allColors.length && !selectedColor) return setError('Choose a color to continue.');
    if (!selectedVariantId) return setError('Select a variant to continue.');
    cart.add({ variantId: selectedVariantId, quantity });
    setAdded(true);
    setError('');
    window.setTimeout(() => setAdded(false), 2400);
  };

  const displayPrice = selectedVariant?.priceOverride ?? product.price;
  const displayStock = selectedVariant?.stockQuantity ?? product.stock;

  return (
    <div className="page-wrap product-page">
      <Link to="/shop" className="back-link">
        <ArrowLeft size={15} /> Back to shop
      </Link>
      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-main-image">
            <ProductPhoto className="product-detail-photo" src={images[activeImageIndex] ?? ''} alt={`${product.name}, image ${activeImageIndex + 1}`} loading="eager" />
            {images.length > 0 && (
              <span className="image-index">
                {String(activeImageIndex + 1).padStart(2, '0')} <span>/</span> {String(images.length).padStart(2, '0')}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-thumbnails" role="group" aria-label={`${product.name} image gallery`}>
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`product-thumbnail ${index === activeImageIndex ? 'selected' : ''}`}
                  aria-label={`Show image ${index + 1} of ${images.length}`}
                  aria-pressed={index === activeImageIndex}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <ProductPhoto src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="gallery-note">A piece to keep close — {product.material ?? 'thoughtfully selected fabric'}.</div>
        </div>
        <div className="product-detail-copy">
          <span className="eyebrow">
            {product.category} <span className="eyebrow-separator">/</span> {product.badge ?? 'VERA essentials'}
          </span>
          <div className="detail-title-row">
            <h1>{product.name}</h1>
            <WishlistButton productId={product.id} className="detail-heart" />
          </div>
          <p className="detail-price">{formatPrice(displayPrice)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-material">
            <span>Considered fabric</span>
            <span>{product.material ?? 'Made for repeat wear'}</span>
          </div>

          {!!allSizes.length && (
            <fieldset className="choice-field">
              <legend>Choose size <span>{selectedSize ? `Selected · ${selectedSize}` : 'Required'}</span></legend>
              <div className="size-options">
                {allSizes.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`size-option ${selectedSize === option ? 'selected' : ''} ${!isSizeAvailable(option) ? 'unavailable' : ''}`}
                    aria-pressed={selectedSize === option}
                    aria-disabled={!isSizeAvailable(option)}
                    onClick={() => {
                      handleSizeSelect(option);
                      setError('');
                    }}
                    disabled={!isSizeAvailable(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button type="button" className="size-guide-link" onClick={() => setError('Our size guide will be available soon.')}>
                Find your fit <ArrowRight size={13} />
              </button>
            </fieldset>
          )}

          {!!allColors.length && (
            <fieldset className="choice-field">
              <legend>Choose color <span>{selectedColor || 'Required'}</span></legend>
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
                    onClick={() => {
                      handleColorSelect(option.name);
                      setError('');
                    }}
                    disabled={!isColorAvailable(option.name)}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <div className="detail-buy-row">
            <div className="quantity-control detail-quantity" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1}>
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => Math.min(displayStock, current + 1))} disabled={quantity >= displayStock}>
                <Plus size={14} />
              </button>
            </div>
            <Button onClick={addToBag} className="detail-add-button">
              {added ? <><Check size={16} /> Added to bag</> : 'Add to bag'}
            </Button>
          </div>
          <p className="stock-note">{displayStock > 10 ? 'In stock · ready for your wardrobe' : `Only ${displayStock} left`}</p>
          {error && <p className="inline-error" role="alert">{error}</p>}
          <p className="detail-assurance">Complimentary delivery on orders over {formatPrice(brand.freeShippingThreshold)}. Easy returns within 30 days.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A natural pairing</span>
              <h2>You may also love</h2>
            </div>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}