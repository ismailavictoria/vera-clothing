import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Link2, Plus, Save, Trash2, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminData } from '../features/admin/AdminDataContext';
import { moveItem, PageTitle, ReorderControls } from '../features/admin/AdminShared';
import type { AdminProduct } from '../features/admin/types';
import { categoryNames, products as storefrontProducts } from '../data/products';
import { MAX_PRODUCT_IMAGES, validateProductImages } from '../lib/productImages';
import { ProductPhoto } from '../components/ProductPhoto';
import { Button } from '../components/ui';
import { useCurrency } from '../features/currency/CurrencyContext';
import { currencies } from '../config/currency';

const blankProduct = (): Omit<AdminProduct, 'id' | 'updatedAt'> => ({ name: '', description: '', shortDescription: '', category: 'Dresses', price: 0, stock: 0, status: 'Active', images: [], sizes: ['XS', 'S', 'M', 'L'], colors: ['Black'] });

export function AdminProductEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, saveProduct } = useAdminData();
  const { currency, formatPrice } = useCurrency();
  const existing = mode === 'edit' ? products.find((product) => product.id === id) : undefined;
  const [form, setForm] = useState(blankProduct);
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (existing) setForm({ name: existing.name, description: existing.description, shortDescription: existing.shortDescription, category: existing.category, price: existing.price, stock: existing.stock, status: existing.status, images: [...existing.images], sizes: [...existing.sizes], colors: [...existing.colors] });
  }, [existing]);
  const patch = <K extends keyof ReturnType<typeof blankProduct>>(key: K, value: ReturnType<typeof blankProduct>[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateList = (key: 'sizes' | 'colors', value: string) => patch(key, value.split(',').map((entry)=>entry.trim()).filter(Boolean));
  const addImage = () => {
    const value = imageUrl.trim();
    if (!value) return;
    if (form.images.length >= MAX_PRODUCT_IMAGES) return setErrors((current)=>({...current, images:`A product can have no more than ${MAX_PRODUCT_IMAGES} images.`}));
    patch('images', [...form.images, value]); setImageUrl(''); setErrors((current)=>({...current, images:''}));
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Add a product name.';
    if (!form.description.trim()) nextErrors.description = 'Add a product description.';
    if (!Number.isFinite(form.price) || form.price <= 0) nextErrors.price = 'Enter a price greater than zero.';
    if (!Number.isFinite(form.stock) || form.stock < 0) nextErrors.stock = 'Stock cannot be negative.';
    try { validateProductImages(form.images); } catch (error) { nextErrors.images = error instanceof Error ? error.message : 'Check the product images.'; }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const product = saveProduct({ ...form, name: form.name.trim(), description: form.description.trim(), shortDescription: form.shortDescription.trim(), images: validateProductImages(form.images) }, mode === 'edit' ? id : undefined);
    setSaved(true); window.setTimeout(()=>setSaved(false), 1800);
    if (mode === 'create') navigate(`/admin/products/${product.id}/edit`, { replace: true });
  };
  if (mode === 'edit' && !existing && products.some((product)=>product.id===id) === false) return <div className="admin-page"><PageTitle title="Product not found" description="This item is not in the current local preview." action={<Link className="admin-outline-button" to="/admin/products"><ArrowLeft size={15} /> Products</Link>} /></div>;
  const storefrontProduct = existing ? storefrontProducts.find((product)=>product.id===existing.id) : undefined;
  return <div className="admin-page"><PageTitle eyebrow={mode === 'create' ? 'Make room for something new' : 'Your collection'} title={mode === 'create' ? 'Add product' : 'Edit product'} description={mode === 'create' ? 'Bring a new piece into the VERA collection.' : `Update details for ${existing?.name ?? 'this piece'}.`} action={<Link className="admin-back-link" to="/admin/products"><ArrowLeft size={15} /> Back to products</Link>} />
    <form className="product-editor-form" onSubmit={submit} noValidate><div className="editor-main-column"><section className="editor-card"><div className="editor-section-heading"><span>01</span><div><h2>Product details</h2><p>The details customers will see in your store.</p></div></div><div className="admin-form-grid"><label className="admin-field field-span-2"><span>Product name <i>*</i></span><input value={form.name} onChange={(event)=>patch('name',event.target.value)} placeholder="e.g. The Solene Slip Dress" />{errors.name && <small className="admin-field-error">{errors.name}</small>}</label><label className="admin-field field-span-2"><span>Short description</span><input value={form.shortDescription} onChange={(event)=>patch('shortDescription',event.target.value)} placeholder="A one-line introduction to the piece" /></label><label className="admin-field field-span-2"><span>Description <i>*</i></span><textarea rows={5} value={form.description} onChange={(event)=>patch('description',event.target.value)} placeholder="Tell the story of this piece..." />{errors.description && <small className="admin-field-error">{errors.description}</small>}</label><label className="admin-field"><span>Category</span><select value={form.category} onChange={(event)=>patch('category',event.target.value as AdminProduct['category'])}>{categoryNames.filter((name)=>name!=='All pieces').map((name)=> <option key={name}>{name}</option>)}</select></label><label className="admin-field"><span>Price ({currency}) <i>*</i></span><div className="input-prefix"><span>{currencies[currency].symbol}</span><input type="number" min="0.01" step="0.01" value={form.price || ''} onChange={(event)=>patch('price',Number(event.target.value))} placeholder="0.00" /></div>{errors.price && <small className="admin-field-error">{errors.price}</small>}</label></div></section>
      <section className="editor-card"><div className="editor-section-heading"><span>02</span><div><h2>Images</h2><p>First image is the main product image. Add up to five image URLs.</p></div><span className="editor-image-count">{form.images.length} / {MAX_PRODUCT_IMAGES}</span></div><div className="admin-image-add"><label className="sr-only" htmlFor="mock-image-url">Image URL</label><Link2 size={15} /><input id="mock-image-url" value={imageUrl} onChange={(event)=>setImageUrl(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter'){event.preventDefault();addImage();}}} placeholder="Paste a mock image URL" /><button type="button" className="admin-outline-button" disabled={form.images.length>=MAX_PRODUCT_IMAGES} onClick={addImage}><Plus size={14} /> Add image</button></div>{errors.images && <small className="admin-field-error image-error">{errors.images}</small>}{form.images.length ? <div className="editor-image-list">{form.images.map((image,index)=><div className="editor-image-row" key={`${image}-${index}`}><div className="editor-image-thumb"><ProductPhoto src={image} alt={`Product preview ${index+1}`} /></div><div className="editor-image-info"><span className="image-role">{index===0?'MAIN IMAGE':`IMAGE ${index+1}`}</span><span className="editor-image-url">{image}</span></div><div className="editor-image-actions"><ReorderControls index={index} total={form.images.length} onMove={(direction)=>patch('images',moveItem(form.images,index,index+direction))} /><button type="button" className="admin-icon-action danger-action" aria-label={`Remove image ${index+1}`} onClick={()=>patch('images',form.images.filter((_,imageIndex)=>imageIndex!==index))}><Trash2 size={15} /></button></div></div>)}</div> : <div className="editor-empty-images"><ImagePlus size={23} /><strong>No images added</strong><span>Products can be saved without images; a placeholder is shown in the preview.</span></div>}</section>
      <section className="editor-card"><div className="editor-section-heading"><span>03</span><div><h2>Variants</h2><p>Separate sizes and colors with commas.</p></div></div><div className="admin-form-grid"><label className="admin-field field-span-2"><span>Available sizes</span><input value={form.sizes.join(', ')} onChange={(event)=>updateList('sizes',event.target.value)} placeholder="XS, S, M, L" /></label><label className="admin-field field-span-2"><span>Available colors</span><input value={form.colors.join(', ')} onChange={(event)=>updateList('colors',event.target.value)} placeholder="Oat, Black" /></label></div></section></div>
      <aside className="editor-side-column"><section className="editor-card editor-publish-card"><div className="editor-section-heading"><span>04</span><div><h2>Availability</h2><p>Choose whether this product is active.</p></div></div><label className="admin-toggle-row"><span><strong>Active product</strong><small>Visible in the customer storefront</small></span><input type="checkbox" checked={form.status==='Active'} onChange={(event)=>patch('status',event.target.checked?'Active':'Inactive')} /><span className="admin-toggle" aria-hidden="true" /></label><label className="admin-field stock-field"><span>Stock quantity</span><input aria-label="Stock quantity" type="number" min="0" step="1" value={form.stock} onChange={(event)=>patch('stock',Number(event.target.value))} />{errors.stock && <small className="admin-field-error">{errors.stock}</small>}</label><div className="publish-status"><span className={`status-dot ${form.status==='Active'?'online':''}`} />{form.status} in local preview</div></section><section className="editor-card product-preview-card"><div className="editor-section-heading"><div><h2>Store preview</h2><p>How the first image appears in the shop.</p></div></div><div className="store-product-preview"><ProductPhoto src={form.images[0]??''} alt={form.name||'Product preview'} /><div><span>{form.category}</span><strong>{form.name||'Your product name'}</strong><span>{formatPrice(form.price)}</span></div></div>{storefrontProduct && <small className="preview-note">Changes are kept in admin mock data only; the customer storefront sample catalogue is unchanged.</small>}</section><div className="editor-actions"><Button type="submit" fullWidth>{saved?<><Check size={16}/> Saved locally</>:<><Save size={15}/> Save product</>}</Button><Link to="/admin/products" className="admin-cancel-link">Cancel <X size={14}/></Link><div className="mock-data-note"><ArrowRight size={13}/> No backend connected</div></div></aside></form></div>;
}
