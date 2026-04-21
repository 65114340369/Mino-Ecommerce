// ─── Core Product Schema ──────────────────────────────────────────────────────
// Stored in IndexedDB. Each field maps to a DB column / index.

export interface ProductImage {
  id: string;          // uuid-like key
  url: string;         // remote URL or base64 data-URL
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  slug: string;
  name: string;        // ภาษาอังกฤษ (default)
  nameTh?: string;     // ภาษาไทย (optional)
  description: string;
  descriptionTh?: string; // Markdown ภาษาไทย
  price: number;
  originalPrice?: number;
  stock: number;                 // replaces boolean inStock
  images: ProductImage[];        // ordered list; first isPrimary is the cover
  category: string;              // indexed
  tags: string[];                // full-text search target
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  createdAt: number;             // Unix ms — used for sorting "newest"
  updatedAt: number;
}

// ─── Derived / Computed helpers ───────────────────────────────────────────────

export function primaryImage(product: Product): ProductImage | undefined {
  return product.images.find((i) => i.isPrimary) ?? product.images[0];
}

export function isInStock(product: Product): boolean {
  return product.stock > 0;
}

export function discountPercent(product: Product): number {
  if (!product.originalPrice) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}

/** ดึงชื่อสินค้าตามภาษา */
export function productName(product: Product, lang: 'th' | 'en' = 'th'): string {
  if (lang === 'th' && product.nameTh) return product.nameTh;
  return product.name;
}

/** ดึง description ตามภาษา */
export function productDescription(product: Product, lang: 'th' | 'en' = 'th'): string {
  if (lang === 'th' && product.descriptionTh) return product.descriptionTh;
  return product.description;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  product: Product;
  score: number;       // relevance 0–1 (higher = better match)
  matchedFields: ('name' | 'description' | 'tags' | 'category')[];
}
