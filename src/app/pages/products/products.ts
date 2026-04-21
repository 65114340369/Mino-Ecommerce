import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCardComponent, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ 'products.title' | t }}</h1>
        <p>{{ filteredProducts().length }} {{ 'products.items' | t }}</p>
      </div>

      <div class="layout">
        <!-- Sidebar Filter -->
        <aside class="sidebar">
          <div class="filter-section">
            <h3>{{ 'products.category' | t }}</h3>
            <label class="filter-option">
              <input type="radio" name="category" value="" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" />
              <span>{{ 'products.all' | t }}</span>
            </label>
            @for (cat of categories; track cat.key) {
              <label class="filter-option">
                <input type="radio" name="category" [value]="cat.key" [(ngModel)]="selectedCategory" (ngModelChange)="applyFilters()" />
                <span>{{ catName(cat.key) }}</span>
              </label>
            }
          </div>

          <div class="filter-section">
            <h3>{{ 'products.price' | t }}</h3>
            @for (range of priceRanges; track range.label) {
              <label class="filter-option">
                <input type="radio" name="price" [value]="range.value" [(ngModel)]="selectedPriceRange" (ngModelChange)="applyFilters()" />
                <span>{{ range.label }}</span>
              </label>
            }
          </div>

          <div class="filter-section">
            <h3>{{ i18n.lang() === 'en' ? 'STOCK' : 'สต็อก' }}</h3>
            <label class="filter-option">
              <input type="checkbox" [(ngModel)]="inStockOnly" (ngModelChange)="applyFilters()" />
              <span>{{ 'products.instock' | t }}</span>
            </label>
          </div>

          <div class="filter-section">
            <h3>{{ 'products.sort' | t }}</h3>
            <select class="sort-select" [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
              <option value="default">{{ 'products.default' | t }}</option>
              <option value="price-asc">{{ 'products.price_asc' | t }}</option>
              <option value="price-desc">{{ 'products.price_desc' | t }}</option>
              <option value="rating">{{ 'products.rating' | t }}</option>
              <option value="newest">{{ 'products.newest' | t }}</option>
            </select>
          </div>

          <button class="clear-btn" (click)="clearFilters()">{{ 'products.clear' | t }}</button>
        </aside>

        <!-- Product Grid -->
        <main class="products-area">
          @if (selectedCategory || selectedPriceRange !== 'all' || inStockOnly) {
            <div class="active-filters">
              @if (selectedCategory) {
                <span class="filter-tag">
                  {{ getCategoryName(selectedCategory) }}
                  <button (click)="selectedCategory = ''; applyFilters()">×</button>
                </span>
              }
              @if (selectedPriceRange !== 'all') {
                <span class="filter-tag">
                  {{ getPriceLabel(selectedPriceRange) }}
                  <button (click)="selectedPriceRange = 'all'; applyFilters()">×</button>
                </span>
              }
              @if (inStockOnly) {
                <span class="filter-tag">
                  {{ 'products.stock_only' | t }}
                  <button (click)="inStockOnly = false; applyFilters()">×</button>
                </span>
              }
            </div>
          }

          @if (loading()) {
            <div class="products-grid">
              @for (i of skeletons; track i) {
                <div class="card-skeleton">
                  <div class="sk-image"></div>
                  <div class="sk-body">
                    <div class="sk-line short"></div>
                    <div class="sk-line"></div>
                    <div class="sk-line medium"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="empty-state">
              <span>🔍</span>
              <p>{{ 'products.empty' | t }}</p>
              <button class="btn-primary" (click)="clearFilters()">{{ 'products.clear' | t }}</button>
            </div>
          } @else {
            <div class="products-grid">
              @for (product of filteredProducts(); track product.id) {
                <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
              }
            </div>
          }
        </main>
      </div>
    </div>

    @if (showToast) {
      <div class="toast" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ 'cart.added' | t }}
      </div>
    }
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; }
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 800; color: #111; margin: 0 0 0.25rem; letter-spacing: -0.03em; }
    .page-header p { color: #999; font-size: 0.875rem; margin: 0; }
    .layout { display: grid; grid-template-columns: 220px 1fr; gap: 2rem; align-items: start; }
    .sidebar { position: sticky; top: 80px; background: white; border: 1px solid #f0f0f0; border-radius: 12px; padding: 1.5rem; }
    .filter-section { margin-bottom: 1.75rem; }
    .filter-section h3 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #999; margin: 0 0 0.75rem; }
    .filter-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.875rem; color: #444; }
    .filter-option input { accent-color: #6366f1; }
    .sort-select { width: 100%; padding: 0.5rem 0.75rem; border: 1.5px solid #e5e5e5; border-radius: 8px; font-size: 0.875rem; color: #333; background: white; cursor: pointer; }
    .clear-btn { width: 100%; padding: 0.6rem; border: 1.5px solid #e5e5e5; border-radius: 8px; background: white; font-size: 0.875rem; color: #666; cursor: pointer; transition: all 0.2s; }
    .clear-btn:hover { border-color: #111; color: #111; }
    .active-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
    .filter-tag { display: inline-flex; align-items: center; gap: 0.4rem; background: #ede9fe; color: #6366f1; font-size: 0.8rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .filter-tag button { background: none; border: none; color: #6366f1; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; }
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: #999; }
    .empty-state span { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .empty-state p { margin-bottom: 1.5rem; }
    .btn-primary { display: inline-flex; align-items: center; background: #111; color: white; padding: 0.65rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.2s; }
    .btn-primary:hover { background: #6366f1; }
    /* Skeleton */
    .card-skeleton { border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; }
    .sk-image { aspect-ratio: 1; background: #f0f0f0; animation: shimmer 1.2s infinite; }
    .sk-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .sk-line { height: 12px; background: #f0f0f0; border-radius: 6px; animation: shimmer 1.2s infinite; }
    .sk-line.short { width: 40%; }
    .sk-line.medium { width: 65%; }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .toast { position: fixed; bottom: 2rem; right: 2rem; background: #111; color: white; padding: 0.75rem 1.25rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; animation: slideIn 0.3s ease; z-index: 200; }
    @keyframes slideIn { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .sidebar { position: static; } .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }
  `],
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected selectedCategory = '';
  protected selectedPriceRange = 'all';
  protected inStockOnly = false;
  protected sortBy = 'default';
  protected showToast = false;
  protected readonly loading = signal(true);
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];

  private allProducts: Product[] = [];
  protected readonly filteredProducts = signal<Product[]>([]);

  protected readonly categories = [
    { key: 'electronics', name: 'อิเล็กทรอนิกส์' },
    { key: 'clothing', name: 'เสื้อผ้า' },
    { key: 'home', name: 'ของใช้ในบ้าน' },
    { key: 'accessories', name: 'เครื่องประดับ' },
  ];

  protected catName(key: string): string {
    return this.i18n.t(`landing.cat.${key}`);
  }

  protected get priceRanges() {
    const lang = this.i18n.lang();
    return [
      { label: lang === 'en' ? 'All'              : 'ทั้งหมด',          value: 'all' },
      { label: lang === 'en' ? 'Under ฿500'       : 'ต่ำกว่า ฿500',     value: 'under500' },
      { label: lang === 'en' ? '฿500 – ฿1,500'   : '฿500 – ฿1,500',   value: '500-1500' },
      { label: lang === 'en' ? '฿1,500 – ฿3,000' : '฿1,500 – ฿3,000', value: '1500-3000' },
      { label: lang === 'en' ? 'Over ฿3,000'      : 'มากกว่า ฿3,000',  value: 'over3000' },
    ];
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      if (params['category']) this.selectedCategory = params['category'];
      this.allProducts = await this.productService.getAll();
      this.loading.set(false);
      this.applyFilters();
    });
  }

  protected applyFilters(): void {
    let result = [...this.allProducts];
    if (this.selectedCategory) result = result.filter((p) => p.category === this.selectedCategory);
    if (this.inStockOnly) result = result.filter((p) => p.stock > 0);
    switch (this.selectedPriceRange) {
      case 'under500': result = result.filter((p) => p.price < 500); break;
      case '500-1500': result = result.filter((p) => p.price >= 500 && p.price <= 1500); break;
      case '1500-3000': result = result.filter((p) => p.price > 1500 && p.price <= 3000); break;
      case 'over3000': result = result.filter((p) => p.price > 3000); break;
    }
    switch (this.sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.createdAt - a.createdAt); break;
    }
    this.filteredProducts.set(result);
  }

  protected clearFilters(): void {
    this.selectedCategory = '';
    this.selectedPriceRange = 'all';
    this.inStockOnly = false;
    this.sortBy = 'default';
    this.applyFilters();
  }

  protected getCategoryName(key: string): string {
    return this.i18n.t(`landing.cat.${key}`);
  }

  protected getPriceLabel(value: string): string {
    return this.priceRanges.find((r) => r.value === value)?.label ?? value;
  }

  protected onAddToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }
}
