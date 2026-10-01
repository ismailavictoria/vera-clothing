import type { Product, ProductCategory, ProductVariant } from '../types/product';
import { validateProductImages } from '../lib/productImages';

export const categories: { name: ProductCategory; image: string; countLabel: string }[] = [
  { name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85', countLabel: '01 — 08' },
  { name: 'Tops', image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=1000&q=85', countLabel: '02 — 12' },
  { name: 'Trousers', image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1000&q=85', countLabel: '03 — 06' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85', countLabel: '04 — 09' },
];

function createVariants(productId: string, sizes: string[], colors: { name: string; hex: string }[], baseStock: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  let variantIndex = 0;
  for (const size of sizes) {
    for (const color of colors) {
      variants.push({
        id: `${productId}-v${variantIndex++}`,
        productId,
        sku: `${productId.toUpperCase()}-${size}-${color.name.toUpperCase().replace(/\s+/g, '-')}`,
        size,
        color: color.name,
        hex: color.hex,
        priceOverride: undefined,
        stockQuantity: Math.max(1, Math.floor(baseStock / (sizes.length * colors.length))),
        isActive: true,
      });
    }
  }
  return variants;
}

const sampleProducts: Product[] = [
  { id: 'p-01', name: 'The Solene Slip Dress', price: 148, description: 'Cut on the bias from fluid satin, Solene moves with a soft, considered ease. A refined neckline and delicate adjustable straps make it an evening piece you will return to.', category: 'Dresses', images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L'], availableColors: [{ name: 'Oat', hex: '#c6b9a3' }, { name: 'Black', hex: '#272624' }], stock: 18, featured: true, badge: 'Bestseller', material: 'Recycled satin', variants: [] },
  { id: 'p-02', name: 'Linen Column Skirt', price: 112, description: 'A clean, elongated line in breathable European linen. Finished with a discreet side fastening and a subtle back slit for natural movement.', category: 'Skirts', images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L', 'XL'], availableColors: [{ name: 'Stone', hex: '#aaa18f' }, { name: 'Ink', hex: '#333b40' }], stock: 12, featured: true, material: '100% European linen', variants: [] },
  { id: 'p-03', name: 'Everyday Poplin Shirt', price: 96, description: 'An easy, slightly oversized shirt with a beautifully crisp handfeel. Wear it buttoned, open, or tucked into your favorite tailoring.', category: 'Tops', images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L', 'XL'], availableColors: [{ name: 'Cloud', hex: '#efeee9' }, { name: 'Blue Stripe', hex: '#8190a1' }], stock: 25, featured: true, badge: 'New', material: 'Organic cotton poplin', variants: [] },
  { id: 'p-04', name: 'Relaxed Tailored Trouser', price: 164, description: 'Thoughtful tailoring meets everyday comfort. A mid-rise waist, softly pleated front, and fluid drape create a silhouette that works from morning to late.', category: 'Trousers', images: ['https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L'], availableColors: [{ name: 'Espresso', hex: '#51483f' }, { name: 'Black', hex: '#272624' }], stock: 9, featured: true, material: 'Responsible viscose blend', variants: [] },
  { id: 'p-05', name: 'Sculpted Knit Tank', price: 68, description: 'A softly structured essential in a fine rib knit. Designed to sit close without feeling restrictive, with a gently curved neckline.', category: 'Tops', images: ['https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L'], availableColors: [{ name: 'Ivory', hex: '#e9e2d5' }, { name: 'Moss', hex: '#72715b' }, { name: 'Black', hex: '#272624' }], stock: 31, material: 'Organic cotton and linen', variants: [] },
  { id: 'p-06', name: 'The Sunday Jumpsuit', price: 188, description: 'One piece, many possibilities. This softly cinched jumpsuit pairs a relaxed bodice with a long, easy leg and practical side pockets.', category: 'Jumpsuits', images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L'], availableColors: [{ name: 'Olive', hex: '#66654e' }, { name: 'Ink', hex: '#333b40' }], stock: 7, featured: true, badge: 'Limited', material: 'Lyocell twill', variants: [] },
  { id: 'p-07', name: 'Soft Structure Tote', price: 124, description: 'A generous everyday carryall with a sculptural profile, reinforced base, and considered interior pocket. Made to get better with time.', category: 'Accessories', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['One size'], availableColors: [{ name: 'Cognac', hex: '#93684e' }, { name: 'Black', hex: '#272624' }], stock: 14, featured: true, material: 'Responsibly sourced leather', variants: [] },
  { id: 'p-08', name: 'Fine Rib Long Sleeve', price: 84, description: 'A lightweight layer with a soft, close fit and clean finish. A dependable foundation, designed for all-season layering.', category: 'Tops', images: ['https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L', 'XL'], availableColors: [{ name: 'Chalk', hex: '#e8e4d9' }, { name: 'Merlot', hex: '#70494a' }], stock: 21, material: 'TENCEL™ modal rib', variants: [] },
  { id: 'p-09', name: 'The Weekend Midi', price: 138, description: 'A graceful midi with gentle gathers and a softly defined waist. Lightweight and versatile, it is made for unhurried afternoons.', category: 'Dresses', images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L'], availableColors: [{ name: 'Terracotta', hex: '#a05c47' }, { name: 'Cream', hex: '#e7dfd2' }], stock: 16, material: 'Cotton voile', variants: [] },
  { id: 'p-10', name: 'Everyday Leather Belt', price: 72, description: 'A minimal finishing touch crafted with a smooth, supple feel and understated brushed buckle.', category: 'Accessories', images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['S', 'M', 'L'], availableColors: [{ name: 'Tan', hex: '#a57b58' }, { name: 'Black', hex: '#272624' }], stock: 20, material: 'Responsibly sourced leather', variants: [] },
  { id: 'p-11', name: 'Pleated Wide-Leg Pant', price: 152, description: 'A fluid wide leg balanced by a tailored waistband. Designed to bring polish to the simplest of outfits.', category: 'Trousers', images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L', 'XL'], availableColors: [{ name: 'Sand', hex: '#b7aa95' }, { name: 'Black', hex: '#272624' }], stock: 11, material: 'Recycled polyester blend', variants: [] },
  { id: 'p-12', name: 'Soft Drape Wrap Top', price: 108, description: 'An artful wrap silhouette with a subtle drape and adjustable tie. A quietly distinctive piece for day or evening.', category: 'Tops', images: ['https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1200&q=85'], availableSizes: ['XS', 'S', 'M', 'L'], availableColors: [{ name: 'Rosewood', hex: '#9a716c' }, { name: 'Black', hex: '#272624' }], stock: 8, badge: 'Almost gone', material: 'Lenzing™ EcoVero™', variants: [] },
];

const productsWithVariants = sampleProducts.map((product) => ({
  ...product,
  images: validateProductImages(product.images),
  variants: createVariants(product.id, product.availableSizes, product.availableColors, product.stock),
}));

export const products: Product[] = productsWithVariants;

export const categoryNames = ['All pieces', ...new Set(products.map((product) => product.category))];