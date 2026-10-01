import { brand } from '../config/brand';
import type { CartLine, Product } from '../types/product';
import { useCurrency } from '../features/currency/CurrencyContext';

export function OrderSummary({ lines, catalog, title = 'Order summary', showDelivery = false }: { lines: CartLine[]; catalog: Product[]; title?: string; showDelivery?: boolean }) {
  const { formatPrice } = useCurrency();
  const items = lines.flatMap((line) => {
    const product = catalog.find((entry) => entry.id === line.productId);
    return product ? [{ line, product }] : [];
  });
  const subtotal = items.reduce((sum, { line, product }) => sum + product.price * line.quantity, 0);
  const delivery = showDelivery && subtotal > 0 && subtotal < brand.freeShippingThreshold ? brand.shippingFee : 0;
  return <section className="order-summary"><h2>{title}</h2><div className="summary-products">{items.map(({ line, product }) => <div className="summary-product" key={line.lineId}><span className="summary-product-name">{product.name}<small>{line.quantity} × {line.size} / {line.color}</small></span><span>{formatPrice(product.price * line.quantity)}</span></div>)}</div><div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>{showDelivery && <div className="summary-row"><span>Delivery</span><span>{delivery ? formatPrice(delivery) : subtotal ? 'Complimentary' : 'Calculated next'}</span></div>}<div className="summary-total"><span>Total</span><strong>{formatPrice(subtotal + delivery)}</strong></div>{showDelivery && <p className="summary-note">{subtotal >= brand.freeShippingThreshold ? 'Complimentary delivery on this order.' : `Complimentary delivery over ${formatPrice(brand.freeShippingThreshold)}.`}</p>}</section>;
}
