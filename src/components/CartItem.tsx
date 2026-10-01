import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Product, ProductVariant } from '../types/product';
import { useCurrency } from '../features/currency/CurrencyContext';
import { QuantitySelector } from './QuantitySelector';
import { ProductPhoto } from './ProductPhoto';
import { getMainProductImage } from '../lib/productImages';

function findVariant(product: Product, variantId: string): ProductVariant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function CartItem({
  product,
  size,
  color,
  quantity,
  variantId,
  onQuantityChange,
  onRemove,
}: {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  variantId: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const { formatPrice } = useCurrency();
  const variant = findVariant(product, variantId);
  const price = variant?.priceOverride ?? product.price;
  const maxStock = variant?.stockQuantity;

  return (
    <article className="cart-item">
      <Link to={`/product/${product.id}`} className="cart-item-image">
        <ProductPhoto src={getMainProductImage(product.images)} alt={product.name} />
      </Link>
      <div className="cart-item-details">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product.id}`} className="cart-item-title">{product.name}</Link>
        <span className="cart-variant">{size} <span aria-hidden="true">·</span> {color}</span>
        <div className="cart-item-bottom">
          <QuantitySelector value={quantity} onChange={onQuantityChange} label={`Quantity for ${product.name}`} max={maxStock} />
          <span className="cart-line-price">{formatPrice(price * quantity)}</span>
        </div>
      </div>
      <button className="icon-button cart-remove" onClick={onRemove} aria-label={`Remove ${product.name} from cart`}>
        <X size={18} />
      </button>
    </article>
  );
}