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
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const related = useMemo(() => product ? products.filter((entry) => entry.category === product.category && entry.id !== product.id).slice(0, 4) : [], [product]);
  useEffect(() => setSelectedImageIndex(0), [productId]);
  if (!product) return <div className="page-wrap"><div className="empty-state"><span className="eyebrow">A little detour</span><h1>We couldn't find that piece.</h1><Link className="button button-primary" to="/shop">Back to the collection</Link></div></div>;
  const images = product.images.slice(0, MAX_PRODUCT_IMAGES);
  const activeImageIndex = Math.min(selectedImageIndex, Math.max(0, images.length - 1));
  const addToBag = () => {
    if (product.availableSizes.length && !size) return setError('Choose your size to continue.');
    if (product.availableColors.length && !color) return setError('Choose a color to continue.');
    cart.add({ productId: product.id, size: size || 'One size', color: color || 'Default', quantity });
    setAdded(true); setError(''); window.setTimeout(() => setAdded(false), 2400);
  };
  return <div className="page-wrap product-page"><Link to="/shop" className="back-link"><ArrowLeft size={15} /> Back to shop</Link><div className="product-detail-layout"><div className="product-gallery"><div className="product-main-image"><ProductPhoto className="product-detail-photo" src={images[activeImageIndex] ?? ''} alt={`${product.name}, image ${activeImageIndex + 1}`} loading="eager" />{images.length > 0 && <span className="image-index">{String(activeImageIndex + 1).padStart(2, '0')} <span>/</span> {String(images.length).padStart(2, '0')}</span>}</div>{images.length > 1 && <div className="product-thumbnails" role="group" aria-label={`${product.name} image gallery`}>{images.map((image, index) => <button key={`${image}-${index}`} type="button" className={`product-thumbnail ${index === activeImageIndex ? 'selected' : ''}`} aria-label={`Show image ${index + 1} of ${images.length}`} aria-pressed={index === activeImageIndex} onClick={() => setSelectedImageIndex(index)}><ProductPhoto src={image} alt="" loading="lazy" /></button>)}</div>}<div className="gallery-note">A piece to keep close — {product.material ?? 'thoughtfully selected fabric'}.</div></div><div className="product-detail-copy"><span className="eyebrow">{product.category} <span className="eyebrow-separator">/</span> {product.badge ?? 'VERA essentials'}</span><div className="detail-title-row"><h1>{product.name}</h1><WishlistButton productId={product.id} className="detail-heart" /></div><p className="detail-price">{formatPrice(product.price)}</p><p className="detail-description">{product.description}</p><div className="detail-material"><span>Considered fabric</span><span>{product.material ?? 'Made for repeat wear'}</span></div>
      {!!product.availableSizes.length && <fieldset className="choice-field"><legend>Choose size <span>{size ? `Selected · ${size}` : 'Required'}</span></legend><div className="size-options">{product.availableSizes.map((option) => <button type="button" key={option} className={`size-option ${size === option ? 'selected' : ''}`} aria-pressed={size === option} onClick={() => { setSize(option); setError(''); }}>{option}</button>)}</div><button type="button" className="size-guide-link" onClick={() => setError('Our size guide will be available soon.')}>Find your fit <ArrowRight size={13} /></button></fieldset>}
      {!!product.availableColors.length && <fieldset className="choice-field"><legend>Choose color <span>{color || 'Required'}</span></legend><div className="color-options">{product.availableColors.map((option) => <button type="button" key={option.name} className={`color-swatch ${color === option.name ? 'selected' : ''}`} style={{ '--swatch': option.hex } as React.CSSProperties} aria-label={option.name} aria-pressed={color === option.name} onClick={() => { setColor(option.name); setError(''); }} />)}</div></fieldset>}
      <div className="detail-buy-row"><div className="quantity-control detail-quantity" aria-label="Quantity"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1}><Minus size={14} /></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} disabled={quantity >= product.stock}><Plus size={14} /></button></div><Button onClick={addToBag} className="detail-add-button">{added ? <><Check size={16} /> Added to bag</> : 'Add to bag'}</Button></div><p className="stock-note">{product.stock > 10 ? 'In stock · ready for your wardrobe' : `Only ${product.stock} left in this color`}</p>{error && <p className="inline-error" role="alert">{error}</p>}<p className="detail-assurance">Complimentary delivery on orders over {formatPrice(brand.freeShippingThreshold)}. Easy returns within 30 days.</p></div></div>{related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">A natural pairing</span><h2>You may also love</h2></div></div><ProductGrid products={related} /></section>}</div>;
}
