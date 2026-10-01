import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, LockKeyhole } from 'lucide-react';
import { useCatalog } from '../features/catalog/CatalogContext';
import { useCart } from '../features/cart/CartContext';
import { Input, Button } from '../components/ui';
import { OrderSummary } from '../components/OrderSummary';

type FormFields = { fullName: string; email: string; phone: string; address: string; city: string; state: string; country: string };
type FieldErrors = Partial<Record<keyof FormFields, string>>;
const initialForm: FormFields = { fullName: '', email: '', phone: '', address: '', city: '', state: '', country: '' };

export function CheckoutPage() {
  const { products } = useCatalog();
  const cart = useCart();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [complete, setComplete] = useState(false);
  const lines = cart.lines.filter((line) => products.some((product) => product.id === line.productId));
  const update = (key: keyof FormFields) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    (Object.keys(form) as (keyof FormFields)[]).forEach((key) => { if (!form[key].trim()) nextErrors[key] = 'This field is required.'; });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.phone && form.phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Enter a valid phone number.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) { setComplete(true); cart.clear(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  if (complete) return <div className="page-wrap checkout-page"><div className="confirmation-card"><span className="confirmation-check"><Check size={25} /></span><span className="eyebrow">A little note of thanks</span><h1>Order <em>received.</em></h1><p>Thank you, {form.fullName.split(' ')[0] || 'friend'}. This is a frontend preview: no order was sent, no payment was taken, and no email was sent.</p><span className="demo-order-number">PREVIEW · VERA-{new Date().getFullYear()}-001</span><Link to="/shop" className="button button-primary">Back to the collection</Link></div></div>;
  if (!lines.length) return <div className="page-wrap checkout-page"><div className="empty-state"><span className="eyebrow">A fresh start</span><h1>Your bag is <em>waiting.</em></h1><p>Add a few favorites before heading to checkout.</p><Link to="/shop" className="button button-primary">Explore the collection</Link></div></div>;
  return <div className="page-wrap checkout-page"><div className="page-intro checkout-intro"><span className="eyebrow">The final little step</span><h1>Almost <em>yours.</em></h1><p>Just a few details, then it’s all yours.</p></div><div className="prototype-banner"><LockKeyhole size={16} /><p><strong>Frontend preview</strong> — this demo does not process payment or submit a real order.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submit} noValidate><div className="form-section-heading"><span className="form-step">01</span><div><h2>Your details</h2><p>How we can reach you</p></div></div><div className="form-grid"><Input label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={update('fullName')} error={errors.fullName} /><Input label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={update('email')} error={errors.email} /><Input label="Phone number" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')} error={errors.phone} /></div><div className="form-section-heading delivery-heading"><span className="form-step">02</span><div><h2>Where to?</h2><p>Your delivery details</p></div></div><div className="form-grid"><Input label="Address" name="address" autoComplete="street-address" value={form.address} onChange={update('address')} error={errors.address} /><Input label="City" name="city" autoComplete="address-level2" value={form.city} onChange={update('city')} error={errors.city} /><Input label="State / Province" name="state" autoComplete="address-level1" value={form.state} onChange={update('state')} error={errors.state} /><Input label="Country" name="country" autoComplete="country-name" value={form.country} onChange={update('country')} error={errors.country} /></div><Button type="submit" fullWidth className="place-order-button">Place order <span aria-hidden="true">—</span> preview only</Button><p className="checkout-legal">By continuing, you acknowledge this is a non-transactional frontend demonstration.</p></form><aside className="checkout-aside"><OrderSummary lines={lines} catalog={products} showDelivery /><Link to="/cart" className="back-link"><ArrowLeft size={15} /> Return to your bag</Link></aside></div></div>;
}
