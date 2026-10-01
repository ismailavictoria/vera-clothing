import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { useCatalog } from '../features/catalog/CatalogContext';
import { useCart } from '../features/cart/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import { Input, Button } from '../components/ui';
import { OrderSummary } from '../components/OrderSummary';
import { createOrder, type CreateOrderRequest, type OrderItemInput } from '../features/orders/orderRepository';

type FormFields = { fullName: string; email: string; phone: string; address: string; city: string; state: string; country: string };
type FieldErrors = Partial<Record<keyof FormFields, string>>;
const initialForm: FormFields = { fullName: '', email: '', phone: '', address: '', city: '', state: '', country: '' };

export function CheckoutPage() {
  const { products } = useCatalog();
  const cart = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const lines = cart.lines.filter((line) => products.some((product) => product.id === line.productId));
  const update = (key: keyof FormFields) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors: FieldErrors = {};
    (Object.keys(form) as (keyof FormFields)[]).forEach((key) => { if (!form[key].trim()) nextErrors[key] = 'This field is required.'; });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Enter a valid phone number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!user) {
      setSubmitError('Please sign in to place an order.');
      navigate('/login', { state: { redirect: '/checkout' } });
      return;
    }

    setSubmitting(true);
    try {
      const shippingAddress = `${form.address}, ${form.city}, ${form.state}, ${form.country}`;
      const total = cart.subtotal;
      if (total <= 0) throw new Error('Cart total must be greater than zero.');

      const orderItems: OrderItemInput[] = lines.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        const unitPrice = variant?.priceOverride ?? product?.price ?? 0;
        return {
          product_id: line.productId,
          product_name: product?.name ?? 'Unknown product',
          quantity: line.quantity,
          unit_price: unitPrice,
          size: line.size,
          color: line.color,
        };
      });

      const orderRequest: CreateOrderRequest = {
        customer_name: form.fullName.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        shipping_address: shippingAddress,
        total,
        items: orderItems,
      };

      const createdOrder = await createOrder(orderRequest);
      setOrderId(createdOrder.id);
      cart.clear();
      setComplete(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="page-wrap checkout-page"><div className="auth-loading">Restoring your session&hellip;</div></div>;
  }

  if (complete && orderId) {
    return (
      <div className="page-wrap checkout-page">
        <div className="confirmation-card">
          <span className="confirmation-check"><Check size={25} /></span>
          <span className="eyebrow">A little note of thanks</span>
          <h1>Order <em>confirmed.</em></h1>
          <p>Thank you, {form.fullName.split(' ')[0] || 'friend'}. Your order has been placed.</p>
          <span className="order-number">Order #{orderId.slice(0, 8).toUpperCase()}</span>
          <Link to="/shop" className="button button-primary">Back to the collection</Link>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="page-wrap checkout-page">
        <div className="empty-state">
          <span className="eyebrow">A fresh start</span>
          <h1>Your bag is <em>waiting.</em></h1>
          <p>Add a few favorites before heading to checkout.</p>
          <Link to="/shop" className="button button-primary">Explore the collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap checkout-page">
      <div className="page-intro checkout-intro">
        <span className="eyebrow">The final little step</span>
        <h1>Almost <em>yours.</em></h1>
        <p>Just a few details, then it&rsquo;s all yours.</p>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <div className="form-section-heading">
            <span className="form-step">01</span>
            <div>
              <h2>Your details</h2>
              <p>How we can reach you</p>
            </div>
          </div>
          <div className="form-grid">
            <Input label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={update('fullName')} error={errors.fullName} />
            <Input label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} />
            <Input label="Phone number" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')} error={errors.phone} />
          </div>
          <div className="form-section-heading delivery-heading">
            <span className="form-step">02</span>
            <div>
              <h2>Where to?</h2>
              <p>Your delivery details</p>
            </div>
          </div>
          <div className="form-grid">
            <Input label="Address" name="address" autoComplete="street-address" value={form.address} onChange={update('address')} error={errors.address} />
            <Input label="City" name="city" autoComplete="address-level2" value={form.city} onChange={update('city')} error={errors.city} />
            <Input label="State / Province" name="state" autoComplete="address-level1" value={form.state} onChange={update('state')} error={errors.state} />
            <Input label="Country" name="country" autoComplete="country-name" value={form.country} onChange={update('country')} error={errors.country} />
          </div>
          {submitError && <div className="submit-error" role="alert"><AlertCircle size={16} /><span>{submitError}</span></div>}
          <Button type="submit" fullWidth className="place-order-button" disabled={submitting} loading={submitting}>
            {submitting ? 'Placing order&hellip;' : 'Place order'}
          </Button>
          <p className="checkout-legal">By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
        </form>
        <aside className="checkout-summary">
          <OrderSummary lines={lines} catalog={products} title="Order summary" showDelivery />
        </aside>
      </div>
    </div>
  );
}