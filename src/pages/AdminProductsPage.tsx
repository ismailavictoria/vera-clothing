import { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, Download, Plus, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductTable, AdminSearch, PageTitle } from '../features/admin/AdminShared';
import { useAdminData } from '../features/admin/AdminDataContext';

export function AdminProductsPage() {
  const { products, deleteProduct } = useAdminData();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const filtered = useMemo(() => products.filter((product) => (status === 'All statuses' || product.status === status) && `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())), [products, search, status]);
  return <div className="admin-page"><PageTitle eyebrow="Your collection" title="Products" description="A considered look at everything in your store." action={<Link className="admin-primary-button" to="/admin/products/new"><Plus size={16} /> Add product</Link>} /><div className="admin-page-summary"><span><strong>{products.length}</strong> products in your collection</span><span>{products.filter((item)=>item.status==='Active').length} active <i /> {products.filter((item)=>item.status==='Inactive').length} inactive</span></div><div className="admin-toolbar"><AdminSearch value={search} onChange={setSearch} placeholder="Search by name or category..." /><div className="admin-toolbar-actions"><label className="admin-filter-select"><SlidersHorizontal size={14} /><select aria-label="Filter product status" value={status} onChange={(event)=>setStatus(event.target.value)}><option>All statuses</option><option>Active</option><option>Inactive</option></select></label><button type="button" className="admin-outline-button" onClick={()=>window.alert('Product export is a preview-only action.')}><Download size={14} /> Export</button></div></div><ProductTable products={filtered} onDelete={deleteProduct} /><div className="admin-table-footer"><span>Showing {filtered.length} of {products.length} products</span><span className="mock-data-note"><ArrowDownWideNarrow size={13} /> Mock data · local preview only</span></div></div>;
}
