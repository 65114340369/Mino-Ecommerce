import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { MarkdownService } from '../../services/markdown.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { Product, primaryImage, isInStock, discountPercent, productName, productDescription } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  template: `
    @if (loading()) {
      <div class="page-container">
        <div class="detail-skeleton">
          <div class="sk-image"></div>
          <div class="sk-info">
            <div class="sk-line short"></div>
            <div class="sk-line title"></div>
            <div class="sk-line medium"></div>
            <div class="sk-line"></div>
            <div class="sk-line medium"></div>
          </div>
        </div>
      </div>
    } @else if (product()) {
      <div class="page-container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="breadcrumb">
          <a routerLink="/">{{ 'nav.home' | t }}</a>
          <span>/</span>
          <a routerLink="/products">{{ 'nav.products' | t }}</a>
          <span>/</span>
          <span>{{ productDisplayName() }}</span>
        </nav>

        <!-- Product Detail -->
        <div class="product-layout">
          <!-- Gallery -->
          <div class="gallery">
            <div class="main-image-wrap">
              <img
                [src]="activeImage()"
                [alt]="product()!.name"
                class="main-image"
                loading="eager"
              />
              @if (product()!.isBestseller) {
                <span class="badge-bestseller">{{ 'common.bestseller' | t }}</span>
              }
              @if (discount() > 0) {
                <span class="badge-discount">-{{ discount() }}%</span>
              }
              @if (!inStock()) {
                <div class="out-of-stock-overlay">{{ 'common.out_stock' | t }}</div>
              }
            </div>
            @if (product()!.images.length > 1) {
              <div class="thumbnails">
                @for (img of product()!.images; track img.id) {
                  <button
                    class="thumb-btn"
                    [class.active]="activeImageId() === img.id"
                    (click)="activeImageId.set(img.id)"
                    [attr.aria-label]="img.alt"
                  >
                    <img [src]="img.url" [alt]="img.alt" loading="lazy" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div class="product-info">
            <p class="product-category">{{ categoryLabel(product()!.category) }}</p>
            <h1 class="product-name">{{ productDisplayName() }}</h1>

            <div class="product-rating">
              <span class="stars">{{ stars(product()!.rating) }}</span>
              <span class="rating-value">{{ product()!.rating }}</span>
              <span class="review-count">({{ product()!.reviewCount }} {{ 'common.reviews' | t }})</span>
            </div>

            <div class="product-price">
              <span class="price">฿{{ product()!.price.toLocaleString() }}</span>
              @if (product()!.originalPrice) {
                <span class="original-price">฿{{ product()!.originalPrice!.toLocaleString() }}</span>
                <span class="discount-badge">-{{ discount() }}%</span>
              }
            </div>

            <!-- Stock indicator -->
            <div class="stock-indicator" [class.low]="product()!.stock > 0 && product()!.stock <= 5" [class.out]="product()!.stock === 0">
              @if (product()!.stock === 0) {
                <span class="stock-dot out"></span> สินค้าหมด
              } @else if (product()!.stock <= 5) {
                <span class="stock-dot low"></span> เหลือเพียง {{ product()!.stock }} ชิ้น!
              } @else {
                <span class="stock-dot in"></span> มีสินค้า ({{ product()!.stock }} ชิ้น)
              }
            </div>

            <div class="product-tags">
              @for (tag of product()!.tags; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </div>

            <!-- Quantity -->
            <div class="quantity-section">
              <label class="qty-label">{{ 'common.qty' | t }}</label>
              <div class="qty-control">
                <button class="qty-btn" (click)="decreaseQty()" [disabled]="quantity() <= 1" aria-label="ลด">−</button>
                <span class="qty-value">{{ quantity() }}</span>
                <button class="qty-btn" (click)="increaseQty()" [disabled]="quantity() >= product()!.stock" aria-label="เพิ่ม">+</button>
              </div>
            </div>

            <!-- Actions -->
            <div class="product-actions">
              <button class="btn-add-cart" [disabled]="!inStock()" (click)="addToCart()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {{ inStock() ? ('common.add_cart' | t) : ('common.out_stock' | t) }}
              </button>
              <a routerLink="/checkout" class="btn-buy-now" [class.disabled]="!inStock()">
                {{ 'common.buy_now' | t }}
              </a>
            </div>

            <!-- Shipping info -->
            <div class="shipping-info">
              <div class="shipping-item"><span>🚚</span><span>{{ 'common.free_ship' | t }}</span></div>
              <div class="shipping-item"><span>🔄</span><span>{{ 'common.return' | t }}</span></div>
              <div class="shipping-item"><span>🛡️</span><span>{{ 'common.authentic' | t }}</span></div>
            </div>
          </div>
        </div>

        <!-- Markdown Description -->
        <section class="description-section">
          <h2 class="desc-title">{{ i18n.lang() === 'en' ? 'Product Details' : 'รายละเอียดสินค้า' }}</h2>
          <div class="markdown-body" [innerHTML]="renderedDescription()"></div>
        </section>

        <!-- Related Products -->
        @if (relatedProducts().length > 0) {
          <section class="related-section">
            <h2 class="related-title">{{ 'common.related' | t }}</h2>
            <div class="related-grid">
              @for (related of relatedProducts(); track related.id) {
                <app-product-card [product]="related" (addToCart)="onRelatedAddToCart($event)" />
              }
            </div>
          </section>
        }
      </div>
    } @else {
      <div class="not-found">
        <span>😕</span>
        <h2>ไม่พบสินค้า</h2>
        <a routerLink="/products" class="btn-back">กลับไปดูสินค้า</a>
      </div>
    }

    @if (showToast) {
      <div class="toast" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        เพิ่มลงตะกร้าแล้ว
      </div>
    }
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }

    /* Skeleton */
    .detail-skeleton { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; }
    .sk-image { aspect-ratio: 1; background: #f0f0f0; border-radius: 16px; animation: shimmer 1.2s infinite; }
    .sk-info { display: flex; flex-direction: column; gap: 1rem; padding-top: 1rem; }
    .sk-line { height: 14px; background: #f0f0f0; border-radius: 6px; animation: shimmer 1.2s infinite; }
    .sk-line.short { width: 30%; }
    .sk-line.title { height: 32px; width: 80%; }
    .sk-line.medium { width: 55%; }
    @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #999; margin-bottom: 2rem; }
    .breadcrumb a { color: #999; text-decoration: none; }
    .breadcrumb a:hover { color: #111; }
    .breadcrumb span:last-child { color: #333; font-weight: 500; }

    .product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 3rem; }

    /* Gallery */
    .gallery { display: flex; flex-direction: column; gap: 0.75rem; }
    .main-image-wrap { position: relative; border-radius: 16px; overflow: hidden; aspect-ratio: 1; background: #f8f8f8; }
    .main-image { width: 100%; height: 100%; object-fit: cover; }
    .badge-bestseller { position: absolute; top: 16px; left: 16px; background: #6366f1; color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
    .badge-discount { position: absolute; top: 16px; right: 16px; background: #ef4444; color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
    .out-of-stock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
    .thumbnails { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .thumb-btn { width: 64px; height: 64px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; cursor: pointer; padding: 0; background: #f5f5f5; transition: border-color 0.2s; }
    .thumb-btn.active { border-color: #6366f1; }
    .thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

    /* Info */
    .product-info { display: flex; flex-direction: column; gap: 1.25rem; }
    .product-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; font-weight: 700; margin: 0; }
    .product-name { font-size: 1.75rem; font-weight: 800; color: #111; margin: 0; line-height: 1.2; letter-spacing: -0.02em; }
    .product-rating { display: flex; align-items: center; gap: 0.5rem; }
    .stars { color: #f59e0b; }
    .rating-value { font-weight: 700; color: #111; }
    .review-count { color: #999; font-size: 0.875rem; }
    .product-price { display: flex; align-items: baseline; gap: 0.75rem; }
    .price { font-size: 2rem; font-weight: 800; color: #111; }
    .original-price { font-size: 1.1rem; color: #bbb; text-decoration: line-through; }
    .discount-badge { background: #fef2f2; color: #ef4444; font-size: 0.8rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }

    /* Stock */
    .stock-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #555; }
    .stock-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .stock-dot.in { background: #22c55e; }
    .stock-dot.low { background: #f59e0b; }
    .stock-dot.out { background: #ef4444; }
    .stock-indicator.low { color: #f59e0b; }
    .stock-indicator.out { color: #ef4444; }

    .product-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag { background: #f5f5f5; color: #555; font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; }

    .quantity-section { display: flex; align-items: center; gap: 1rem; }
    .qty-label { font-size: 0.875rem; font-weight: 600; color: #333; }
    .qty-control { display: flex; align-items: center; border: 1.5px solid #e5e5e5; border-radius: 8px; overflow: hidden; }
    .qty-btn { width: 36px; height: 36px; border: none; background: white; font-size: 1.1rem; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
    .qty-btn:hover:not(:disabled) { background: #f5f5f5; }
    .qty-btn:disabled { color: #ccc; cursor: not-allowed; }
    .qty-value { width: 40px; text-align: center; font-weight: 700; font-size: 0.9rem; border-left: 1.5px solid #e5e5e5; border-right: 1.5px solid #e5e5e5; height: 36px; display: flex; align-items: center; justify-content: center; }

    .product-actions { display: flex; gap: 1rem; }
    .btn-add-cart { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #111; color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 10px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-add-cart:hover:not(:disabled) { background: #6366f1; }
    .btn-add-cart:disabled { background: #ddd; cursor: not-allowed; }
    .btn-buy-now { flex: 1; display: flex; align-items: center; justify-content: center; background: white; color: #111; border: 2px solid #111; padding: 0.875rem 1.5rem; border-radius: 10px; font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: all 0.2s; }
    .btn-buy-now:hover { background: #111; color: white; }
    .btn-buy-now.disabled { opacity: 0.4; pointer-events: none; }

    .shipping-info { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.25rem; background: #fafafa; border-radius: 10px; }
    .shipping-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #555; }

    /* Markdown Description */
    .description-section { padding: 2.5rem 0; border-top: 1px solid #f0f0f0; margin-bottom: 2.5rem; }
    .desc-title { font-size: 1.25rem; font-weight: 800; color: #111; margin: 0 0 1.5rem; letter-spacing: -0.02em; }
    .markdown-body {
      max-width: 720px;
      color: #444;
      line-height: 1.8;
      font-size: 0.95rem;
    }
    :host ::ng-deep .markdown-body h1,
    :host ::ng-deep .markdown-body h2 { font-size: 1.25rem; font-weight: 700; color: #111; margin: 1.5rem 0 0.75rem; letter-spacing: -0.02em; }
    :host ::ng-deep .markdown-body h3 { font-size: 1rem; font-weight: 700; color: #333; margin: 1.25rem 0 0.5rem; }
    :host ::ng-deep .markdown-body p { margin: 0 0 1rem; }
    :host ::ng-deep .markdown-body strong { color: #111; font-weight: 700; }
    :host ::ng-deep .markdown-body em { font-style: italic; }
    :host ::ng-deep .markdown-body code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; font-family: 'Fira Code', 'Courier New', monospace; color: #6366f1; }
    :host ::ng-deep .markdown-body pre { background: #1e1e2e; border-radius: 10px; padding: 1.25rem; overflow-x: auto; margin: 1rem 0; }
    :host ::ng-deep .markdown-body pre code { background: none; color: #cdd6f4; padding: 0; font-size: 0.875rem; }
    :host ::ng-deep .markdown-body blockquote { border-left: 3px solid #6366f1; padding: 0.5rem 1rem; background: #faf9ff; border-radius: 0 8px 8px 0; margin: 1rem 0; color: #555; }
    :host ::ng-deep .markdown-body ul, :host ::ng-deep .markdown-body ol { padding-left: 1.5rem; margin: 0.75rem 0; }
    :host ::ng-deep .markdown-body li { margin-bottom: 0.35rem; }
    :host ::ng-deep .markdown-body table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
    :host ::ng-deep .markdown-body th { background: #f5f5f5; font-weight: 700; color: #111; padding: 0.6rem 0.875rem; text-align: left; border-bottom: 2px solid #e5e5e5; }
    :host ::ng-deep .markdown-body td { padding: 0.6rem 0.875rem; border-bottom: 1px solid #f0f0f0; }
    :host ::ng-deep .markdown-body tr:last-child td { border-bottom: none; }
    :host ::ng-deep .markdown-body hr { border: none; border-top: 1px solid #f0f0f0; margin: 1.5rem 0; }
    :host ::ng-deep .markdown-body a { color: #6366f1; text-decoration: underline; }

    /* Related */
    .related-section { padding-top: 2rem; border-top: 1px solid #f0f0f0; }
    .related-title { font-size: 1.5rem; font-weight: 800; color: #111; margin: 0 0 1.5rem; letter-spacing: -0.02em; }
    .related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }

    .not-found { text-align: center; padding: 6rem 2rem; }
    .not-found span { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .not-found h2 { font-size: 1.5rem; color: #333; margin-bottom: 1.5rem; }
    .btn-back { display: inline-flex; background: #111; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; }

    .toast { position: fixed; bottom: 2rem; right: 2rem; background: #111; color: white; padding: 0.75rem 1.25rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; animation: slideIn 0.3s ease; z-index: 200; }
    @keyframes slideIn { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) {
      .product-layout { grid-template-columns: 1fr; gap: 2rem; }
      .detail-skeleton { grid-template-columns: 1fr; }
      .related-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .related-grid { grid-template-columns: 1fr; }
      .product-actions { flex-direction: column; }
    }
  `],
})
export class ProductDetailComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly markdownService = inject(MarkdownService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected readonly product = signal<Product | undefined>(undefined);
  protected readonly relatedProducts = signal<Product[]>([]);
  protected readonly quantity = signal(1);
  protected readonly loading = signal(true);
  protected readonly activeImageId = signal('');
  protected showToast = false;

  protected readonly renderedDescription = computed((): SafeHtml => {
    const p = this.product();
    if (!p) return '';
    const desc = productDescription(p, this.i18n.lang());
    const html = this.markdownService.render(desc);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      this.loading.set(true);
      const id = Number(params['id']);
      const found = await this.productService.getById(id);
      this.product.set(found);
      if (found) {
        const primary = primaryImage(found);
        this.activeImageId.set(primary?.id ?? found.images[0]?.id ?? '');
        const related = await this.productService.getRelated(found);
        this.relatedProducts.set(related);
      }
      this.quantity.set(1);
      this.loading.set(false);
    });
  }

  protected activeImage(): string {
    const p = this.product();
    if (!p) return '';
    return p.images.find((i) => i.id === this.activeImageId())?.url ?? primaryImage(p)?.url ?? '';
  }

  protected inStock(): boolean {
    const p = this.product();
    return p ? isInStock(p) : false;
  }

  protected discount(): number {
    const p = this.product();
    return p ? discountPercent(p) : 0;
  }

  protected increaseQty(): void {
    const max = this.product()?.stock ?? 1;
    this.quantity.update((q) => Math.min(q + 1, max));
  }

  protected decreaseQty(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  protected addToCart(): void {
    const p = this.product();
    if (!p || !isInStock(p)) return;
    this.cartService.addToCart(p, this.quantity());
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }

  protected onRelatedAddToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }

  protected stars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  // computed — reactive to lang signal
  protected readonly productDisplayName = computed(() => {
    const p = this.product();
    return p ? productName(p, this.i18n.lang()) : '';
  });  protected categoryLabel(cat: string): string {
    return this.i18n.t(`landing.cat.${cat}`);
  }
}

