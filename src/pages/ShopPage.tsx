import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid } from '../components/ProductGrid';
import { ProductFilters, SearchBar } from '../components/ProductFilters';
import { useCatalog } from '../features/catalog/CatalogContext';

export function ShopPage() {
  const { products } = useCatalog();
  const [params, setParams] = useSearchParams();
  const initialCategory = params.get('category') || 'All pieces';
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => products.filter((product) => (category === 'All pieces' || product.category === category) && `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(search.trim().toLowerCase())), [category, search]);
  const changeCategory = (next: string) => { setCategory(next); if (next === 'All pieces') params.delete('category'); else params.set('category', next); setParams(params); };
  return <div className="page-wrap shop-page"><div className="page-intro shop-intro"><span className="eyebrow">A little something for every day</span><h1>Find your <em>everyday.</em></h1><p>Considered pieces, made to be worn your way.</p></div><div className="shop-toolbar"><SearchBar value={search} onChange={setSearch} /><span className="result-count">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</span></div><ProductFilters category={category} onCategoryChange={changeCategory} /><ProductGrid products={filtered} /></div>;
}
