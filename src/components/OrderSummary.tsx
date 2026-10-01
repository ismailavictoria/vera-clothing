import { brand } from '../config/brand';
import type { CartLine, Product, ProductVariant } from '../types/product';
import { useCurrency } from '../features/currency/CurrencyContext';

function findVariant(products: Product[], variantId: string): ProductVariant | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return variant;
  }
  return undefined;
}

export function OrderSummary({ lines, catalog, title = 'Order summary', showDelivery = false }: { lines: CartLine[]; catalog: Product[]; title?: string; showDelivery?: boolean }) {
  const { formatPrice } = useCurrency();
  const items = lines.flatMap((line) => {
    const product = catalog.find((entry) => entry.id === line.productId);
    const variant = product ? findVariant(catalog, line.variantId) : undefined;
    return product ? [{ line, product, variant }] : [];
  });
  const subtotal = items.reduce((sum, { line, product, variant }) => {
    const price = variant?.priceOverride ?? product.price ?? 0;
    return sum + price * line.quantity;
  }, 0);
  const delivery = showDelivery && subtotal > 0 && subtotal < brand.freeShippingThreshold ? brand.shippingFee : 0;
  return <section className="order-summary"><h2>{title}</h2><div className="summary-products">{items.map(({ line, product, variant }) => <div className="summary-product" key={line.lineId}><span className="summary-product-name">{product.name}<small>{line.quantity} × {line.size} / {line.color}</small></span><span>{formatPrice((variant?.priceOverride ?? product.price) * line.quantity)}</span></div>)}</div><div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>{showDelivery && <div className="summary-row"><span>Delivery</span><span>{delivery ? formatPrice(delivery) : subtotal ? 'Complimentary' : 'Calculated next'}</span></div>}<div className="summary-total"><span>Total</span><strong>{formatPrice(subtotal + delivery)}</strong></div>{showDelivery && <p className="summary-note">{subtotal >= brand.freeShippingThreshold ? 'Complimentary delivery on this order.' : `Complimentary delivery over ${formatPrice(brand.freeShippingThreshold)}.`}</p>}</section>;
}