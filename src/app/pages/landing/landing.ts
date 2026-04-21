import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ProductCardComponent } from '../../shared/product-card/product-card';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <span class="hero-tag">{{ 'landing.tag' | t }}</span>
        <h1 class="hero-title">
          {{ 'landing.title1' | t }}<br>
          <span class="hero-accent">{{ 'landing.title2' | t }}</span>
        </h1>
        <p class="hero-desc">{{ 'landing.desc' | t }}</p>
        <div class="hero-actions">
          <a routerLink="/products" class="btn-primary">{{ 'landing.cta' | t }}</a>
          <a routerLink="/products" class="btn-ghost">{{ 'landing.new' | t }}</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>10K+</strong><span>{{ 'landing.customers' | t }}</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><strong>500+</strong><span>{{ 'landing.products' | t }}</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><strong>4.9★</strong><span>{{ 'landing.rating' | t }}</span></div>
        </div>
      </div>
      <div class="hero-image-wrap">
        <div class="hero-image-bg"></div>
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
          alt="Hero product"
          class="hero-image"
          loading="eager"
        />
      </div>
    </section>

    <!-- Categories -->
    <section class="categories">
      <div class="section-container">
        <div class="category-grid">
          @for (cat of categories; track cat.key) {
            <a [routerLink]="['/products']" [queryParams]="{ category: cat.key }" class="category-card">
              <span class="category-icon">{{ cat.icon }}</span>
              <span class="category-name">{{ catName(cat.key) }}</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Bestsellers -->
    <section class="bestsellers">
      <div class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">{{ 'landing.bestseller' | t }}</h2>
            <p class="section-subtitle">{{ 'landing.bestsub' | t }}</p>
          </div>
          <a routerLink="/products" class="see-all">{{ 'landing.seeall' | t }}</a>
        </div>

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
        } @else {
          <div class="products-grid">
            @for (product of bestsellers(); track product.id) {
              <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
            }
          </div>
        }
      </div>
    </section>

    <!-- Banner -->
    <section class="promo-banner">
      <div class="section-container">
        <div class="banner-inner">
          <div class="banner-text">
            <h2>{{ 'landing.banner.title' | t }}</h2>
            <p>{{ 'landing.banner.desc' | t }}</p>
            <a routerLink="/products" class="btn-primary">{{ 'landing.banner.cta' | t }}</a>
          </div>
          <div class="banner-decoration"><span>🚚</span></div>
        </div>
      </div>
    </section>

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
    .hero {
      min-height: calc(100vh - 64px);
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    .hero-tag {
      display: inline-block;
      background: #ede9fe;
      color: #6366f1;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    .hero-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #111;
      margin: 0 0 1.25rem;
    }
    .hero-accent { color: #6366f1; }
    .hero-desc { color: #666; font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; }
    .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      background: #111;
      color: white;
      padding: 0.75rem 1.75rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #6366f1; }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      color: #111;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      border: 1.5px solid #e5e5e5;
      transition: border-color 0.2s;
    }
    .btn-ghost:hover { border-color: #111; }
    .hero-stats { display: flex; align-items: center; gap: 1.5rem; }
    .stat { display: flex; flex-direction: column; }
    .stat strong { font-size: 1.25rem; font-weight: 800; color: #111; }
    .stat span { font-size: 0.75rem; color: #999; }
    .stat-divider { width: 1px; height: 32px; background: #e5e5e5; }
    .hero-image-wrap {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      aspect-ratio: 4/5;
    }
    .hero-image-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
    }
    .hero-image { position: relative; width: 100%; height: 100%; object-fit: cover; }

    .categories { background: #fafafa; padding: 3rem 0; }
    .section-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      background: white;
      border-radius: 12px;
      border: 1.5px solid #f0f0f0;
      text-decoration: none;
      transition: border-color 0.2s, transform 0.2s;
    }
    .category-card:hover { border-color: #6366f1; transform: translateY(-2px); }
    .category-icon { font-size: 2rem; }
    .category-name { font-size: 0.85rem; font-weight: 600; color: #333; }

    .bestsellers { padding: 4rem 0; }
    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .section-title { font-size: 1.75rem; font-weight: 800; color: #111; margin: 0 0 0.25rem; letter-spacing: -0.03em; }
    .section-subtitle { color: #999; font-size: 0.875rem; margin: 0; }
    .see-all { color: #6366f1; text-decoration: none; font-size: 0.875rem; font-weight: 600; }
    .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }

    /* Skeleton */
    .card-skeleton { border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; }
    .sk-image { aspect-ratio: 1; background: #f0f0f0; animation: shimmer 1.2s infinite; }
    .sk-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .sk-line { height: 12px; background: #f0f0f0; border-radius: 6px; animation: shimmer 1.2s infinite; }
    .sk-line.short { width: 40%; }
    .sk-line.medium { width: 65%; }
    @keyframes shimmer {
      0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
    }

    .promo-banner { padding: 2rem 0 4rem; }
    .banner-inner {
      background: linear-gradient(135deg, #111 0%, #1e1b4b 100%);
      border-radius: 16px;
      padding: 3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .banner-text h2 { color: white; font-size: 1.75rem; font-weight: 800; margin: 0 0 0.5rem; }
    .banner-text p { color: #aaa; margin: 0 0 1.5rem; }
    .banner-decoration { font-size: 5rem; opacity: 0.3; }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #111;
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      z-index: 200;
    }
    @keyframes slideIn {
      from { transform: translateY(1rem); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .hero-image-wrap { display: none; }
      .products-grid { grid-template-columns: repeat(2, 1fr); }
      .category-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .products-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class LandingComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  protected readonly i18n = inject(I18nService);

  protected readonly bestsellers = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected showToast = false;
  protected readonly skeletons = [1, 2, 3, 4];

  protected readonly categories = [
    { key: 'electronics', name: 'อิเล็กทรอนิกส์', icon: '💻' },
    { key: 'clothing', name: 'เสื้อผ้า', icon: '👕' },
    { key: 'home', name: 'ของใช้ในบ้าน', icon: '🏠' },
    { key: 'accessories', name: 'เครื่องประดับ', icon: '👜' },
  ];

  protected catName(key: string): string {
    return this.i18n.t(`landing.cat.${key}`);
  }

  async ngOnInit(): Promise<void> {
    const data = await this.productService.getBestsellers();
    this.bestsellers.set(data);
    this.loading.set(false);
  }

  protected onAddToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2500);
  }
}
