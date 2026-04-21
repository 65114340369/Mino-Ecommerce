import { Component, input, output, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product, primaryImage, isInStock, discountPercent, productName } from '../../models/product.model';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="card">
      <a [routerLink]="['/products', product().id]" class="card-image-wrap">
        <img
          [src]="coverImage()"
          [alt]="product().name"
          loading="lazy"
          class="card-image"
        />
        @if (product().isBestseller) {
          <span class="badge-bestseller">{{ 'common.bestseller' | t }}</span>
        }
        @if (discount() > 0) {
          <span class="badge-discount">-{{ discount() }}%</span>
        }
        @if (!inStock()) {
          <div class="out-of-stock-overlay">{{ 'common.out_stock' | t }}</div>
        }
        @if (product().images.length > 1) {
          <span class="multi-image-hint">+{{ product().images.length - 1 }}</span>
        }
      </a>
      <div class="card-body">
        <p class="card-category">{{ categoryLabel(product().category) }}</p>
        <a [routerLink]="['/products', product().id]" class="card-name">{{ displayName() }}</a>
        <div class="card-rating">
          <span class="stars">{{ stars(product().rating) }}</span>
          <span class="review-count">({{ product().reviewCount }})</span>
        </div>
        <div class="card-footer">
          <div class="price-group">
            <span class="price">฿{{ product().price.toLocaleString() }}</span>
            @if (product().originalPrice) {
              <span class="original-price">฿{{ product().originalPrice!.toLocaleString() }}</span>
            }
          </div>
          <div class="card-right">
            <span class="stock-label" [class.low]="product().stock > 0 && product().stock <= 5">
              @if (product().stock > 5) { เหลือ {{ product().stock }} }
              @else if (product().stock > 0) { เหลือ {{ product().stock }}! }
            </span>
            <button
              class="add-btn"
              [disabled]="!inStock()"
              (click)="addToCart.emit(product())"
              aria-label="เพิ่มลงตะกร้า"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; transition: box-shadow 0.2s, transform 0.2s; }
    .card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .card-image-wrap { display: block; position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f8f8; }
    .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .card:hover .card-image { transform: scale(1.04); }
    .badge-bestseller { position: absolute; top: 10px; left: 10px; background: #6366f1; color: white; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
    .badge-discount { position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
    .out-of-stock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
    .multi-image-hint { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
    .card-body { padding: 1rem; }
    .card-category { font-size: 0.72rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.3rem; }
    .card-name { display: block; font-size: 0.9rem; font-weight: 600; color: #111; text-decoration: none; line-height: 1.4; margin-bottom: 0.4rem; }
    .card-name:hover { color: #6366f1; }
    .card-rating { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.75rem; }
    .stars { color: #f59e0b; font-size: 0.8rem; }
    .review-count { font-size: 0.75rem; color: #999; }
    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .price-group { display: flex; align-items: baseline; gap: 0.4rem; }
    .price { font-size: 1rem; font-weight: 700; color: #111; }
    .original-price { font-size: 0.8rem; color: #bbb; text-decoration: line-through; }
    .card-right { display: flex; align-items: center; gap: 0.4rem; }
    .stock-label { font-size: 0.65rem; color: #999; }
    .stock-label.low { color: #ef4444; font-weight: 600; }
    .add-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: #111; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; flex-shrink: 0; }
    .add-btn:hover { background: #6366f1; }
    .add-btn:disabled { background: #ddd; cursor: not-allowed; }
  `],
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly addToCart = output<Product>();
  protected readonly i18n = inject(I18nService);

  protected coverImage(): string {
    return primaryImage(this.product())?.url ?? '';
  }

  protected inStock(): boolean { return isInStock(this.product()); }
  protected discount(): number { return discountPercent(this.product()); }

  // computed signal — re-evaluates when i18n.lang() changes
  protected readonly displayName = computed(() =>
    productName(this.product(), this.i18n.lang())
  );

  protected stars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  protected categoryLabel(cat: string): string {
    return this.i18n.t(`landing.cat.${cat}`);
  }
}
