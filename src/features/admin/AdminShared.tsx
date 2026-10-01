import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronDown, Eye, Pencil, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdminProduct, OrderStatus } from './types';
import { ProductPhoto } from '../../components/ProductPhoto';
import { getMainProductImage } from '../../lib/productImages';
import { useCurrency } from '../currency/CurrencyContext';

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="admin-page-title"><div>{eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="admin-page-action">{action}</div>}</div>;
}

export function AdminSearch({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="admin-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search records</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export function StatusPill({ status }: { status: string }) {
  const variant = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`admin-status status-${variant}`}><span />{status}</span>;
}

export function ProductTable({ products, onDelete }: { products: AdminProduct[]; onDelete: (id: string) => void }) {
  const { formatPrice } = useCurrency();
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null);
  const deleteProduct = (product: AdminProduct) => { if (window.confirm(`Remove ${product.name} from the local admin preview?`)) onDelete(product.id); };
  return <>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Images</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><ProductPhoto src={getMainProductImage(product.images)} alt="" /><div><button type="button" className="admin-product-name" onClick={() => setViewingProduct(product)}>{product.name}</button><small>#{product.id}</small></div></div></td><td>{product.category}</td><td>{formatPrice(product.price)}</td><td><span className={product.stock < 10 ? 'low-stock-value' : ''}>{product.stock}</span></td><td><StatusPill status={product.status} /></td><td><span className="image-count">{product.images.length} / 5</span></td><td><div className="admin-row-actions"><button type="button" className="admin-text-action" onClick={() => setViewingProduct(product)}><Eye size={12}/> View</button><Link to={`/admin/products/${product.id}/edit`} className="admin-text-action"><Pencil size={12}/> Edit</Link><button type="button" className="admin-text-action delete-product-action" onClick={() => deleteProduct(product)}><Trash2 size={12}/> Delete</button></div></td></tr>)}</tbody></table>{products.length === 0 && <div className="admin-no-results">No products match this view.</div>}</div>
    {viewingProduct && <div className="admin-drawer-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)setViewingProduct(null);}}><aside className="order-drawer product-view-drawer" role="dialog" aria-modal="true" aria-labelledby="view-product-title"><div className="drawer-heading"><div><span className="admin-eyebrow">Product preview</span><h2 id="view-product-title">{viewingProduct.name}</h2></div><button className="admin-icon-action" aria-label="Close product preview" onClick={()=>setViewingProduct(null)}><X size={18}/></button></div><ProductPhoto className="product-view-image" src={getMainProductImage(viewingProduct.images)} alt={viewingProduct.name}/><div className="product-view-meta"><StatusPill status={viewingProduct.status}/><span>{viewingProduct.category}</span></div><p className="product-view-description">{viewingProduct.description}</p><div className="product-view-stats"><span>Price<strong>{formatPrice(viewingProduct.price)}</strong></span><span>Stock<strong>{viewingProduct.stock}</strong></span><span>Images<strong>{viewingProduct.images.length} / 5</strong></span></div><div className="product-view-variants"><strong>Sizes</strong><span>{viewingProduct.sizes.join(' · ') || 'No sizes specified'}</span><strong>Colors</strong><span>{viewingProduct.colors.join(' · ') || 'No colors specified'}</span></div><Link className="admin-primary-button" to={`/admin/products/${viewingProduct.id}/edit`}><Pencil size={14}/> Edit product</Link></aside></div>}
  </>;
}

export function ProductStatusSelect({ value, onChange }: { value: string; onChange: (value: OrderStatus) => void }) {
  const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  return <label className="admin-select-wrap"><span className="sr-only">Update order status</span><select value={value} onChange={(event) => onChange(event.target.value as OrderStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={13} aria-hidden="true" /></label>;
}

export function MockImagePreview({ src, index, selected, onClick }: { src: string; index: number; selected?: boolean; onClick?: () => void }) {
  return <button type="button" className={`mock-image-preview ${selected ? 'selected' : ''}`} onClick={onClick} aria-label={`Preview image ${index + 1}`}><ProductPhoto src={src} alt="" />{index === 0 && <span className="main-image-flag"><Check size={11} /> Main</span>}{index > 0 && <span className="mock-image-index">{index + 1}</span>}</button>;
}

export const moveItem = <T,>(list: T[], from: number, to: number): T[] => {
  if (from < 0 || from >= list.length || to < 0 || to >= list.length) return list;
  const next = [...list]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
};
export const ReorderControls = ({ index, total, onMove }: { index: number; total: number; onMove: (direction: -1 | 1) => void }) => <div className="image-reorder"><button type="button" aria-label="Move image earlier" title="Move earlier" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={13} /></button><button type="button" aria-label="Move image later" title="Move later" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown size={13} /></button></div>;
