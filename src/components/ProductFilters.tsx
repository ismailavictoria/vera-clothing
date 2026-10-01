import { Search, SlidersHorizontal } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useCatalog } from '../features/catalog/CatalogContext';

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="search-field"><Search size={17} aria-hidden="true" /><span className="sr-only">Search products</span><input value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} placeholder="Search pieces..." /></label>;
}

export function ProductFilters({ category, onCategoryChange }: { category: string; onCategoryChange: (category: string) => void }) {
  const { products } = useCatalog();
  const categoryNames = ['All pieces', ...new Set(products.map((product) => product.category))];
  return <div className="filter-row"><div className="filter-label"><SlidersHorizontal size={15} aria-hidden="true" /><span>Filter by</span></div><div className="filter-chips" aria-label="Product categories">{categoryNames.map((name) => <button key={name} type="button" className={`filter-chip ${category === name ? 'active' : ''}`} aria-pressed={category === name} onClick={() => onCategoryChange(name)}>{name}</button>)}</div></div>;
}
