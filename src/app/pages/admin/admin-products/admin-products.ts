import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product, primaryImage, isInStock } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="products-page">
      <div class="page-header">
        <div>
          <h1>จัดการสินค้า</h1>
          <p>{{ products().length }} รายการ</p>
        </div>
        <a routerLink="/admin/products/new" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          เพิ่มสินค้า
        </a>
      </div>

      <!-- Search & Filter -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()"
            placeholder="ค้นหาสินค้า..." class="search-input" />
        </div>
        <select [(ngModel)]="filterCategory" (ngModelChange)="applyFilter()" class="filter-select">
          <option value="">ทุกหมวดหมู่</option>
          <option value="electronics">อิเล็กทรอนิกส์</option>
          <option value="clothing">เสื้อผ้า</option>
          <option value="home">ของใช้ในบ้าน</option>
          <option value="accessories">เครื่องประดับ</option>
        </select>
        <select [(ngModel)]="filterStock" (ngModelChange)="applyFilter()" class="filter-select">
          <option value="">ทุกสถานะ</option>
          <option value="in">มีสต็อก</option>
          <option value="low">สต็อกต่ำ (≤5)</option>
          <option value="out">หมด</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>หมวดหมู่</th>
              <th>ราคา</th>
              <th>สต็อก</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filtered(); track p.id) {
              <tr>
                <td>
                  <div class="product-cell">
                    <img [src]="getImage(p)" [alt]="p.name" class="product-thumb" />
                    <div>
                      <p class="product-name">{{ p.name }}</p>
                      <p class="product-slug">{{ p.slug }}</p>
                    </div>
                  </div>
                </td>
                <td><span class="category-tag">{{ categoryLabel(p.category) }}</span></td>
                <td>
                  <div class="price-cell">
                    <span class="price">฿{{ p.price.toLocaleString() }}</span>
                    @if (p.originalPrice) {
                      <span class="original">฿{{ p.originalPrice.toLocaleString() }}</span>
                    }
                  </div>
                </td>
                <td>
                  <div class="stock-edit">
                    <button class="stock-btn" (click)="adjustStock(p, -1)" [disabled]="p.stock === 0">−</button>
                    <span class="stock-val" [class.low]="p.stock > 0 && p.stock <= 5" [class.out]="p.stock === 0">
                      {{ p.stock }}
                    </span>
                    <button class="stock-btn" (click)="adjustStock(p, 1)">+</button>
                  </div>
                </td>
                <td>
                  @if (p.stock === 0) {
                    <span class="badge out">หมด</span>
                  } @else if (p.stock <= 5) {
                    <span class="badge low">สต็อกต่ำ</span>
                  } @else {
                    <span class="badge in">มีสินค้า</span>
                  }
                </td>
                <td>
                  <div class="action-btns">
                    <a [routerLink]="['/admin/products', p.id, 'edit']" class="action-btn edit" title="แก้ไข">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </a>
                    <a [routerLink]="['/products', p.id]" target="_blank" class="action-btn view" title="ดูหน้าสินค้า">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </a>
                    <button class="action-btn delete" (click)="deleteProduct(p)" title="ลบ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filtered().length === 0) {
          <div class="empty-table">ไม่พบสินค้า</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .products-page { max-width: 1100px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-header p { font-size: 0.8rem; color: #94a3b8; margin: 0; }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: #2563eb; color: white; padding: 0.6rem 1.125rem;
      border-radius: 8px; text-decoration: none; font-size: 0.875rem;
      font-weight: 600; transition: background 0.2s;
    }
    .btn-primary:hover { background: #1d4ed8; }

    .toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .search-wrap {
      display: flex; align-items: center; gap: 0.5rem;
      background: white; border: 1.5px solid #e2e8f0; border-radius: 8px;
      padding: 0 0.75rem; flex: 1; min-width: 200px;
    }
    .search-input { border: none; outline: none; font-size: 0.875rem; padding: 0.55rem 0; width: 100%; }
    .filter-select {
      padding: 0.55rem 0.875rem; border: 1.5px solid #e2e8f0;
      border-radius: 8px; font-size: 0.875rem; background: white;
      color: #334155; cursor: pointer;
    }

    .table-wrap { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f8fafc; padding: 0.75rem 1rem;
      font-size: 0.72rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.04em;
      text-align: left; border-bottom: 1px solid #e2e8f0;
    }
    .data-table td { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: #f8fafc; }

    .product-cell { display: flex; align-items: center; gap: 0.75rem; }
    .product-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; background: #f1f5f9; flex-shrink: 0; }
    .product-name { font-size: 0.875rem; font-weight: 600; color: #0f172a; margin: 0 0 0.15rem; }
    .product-slug { font-size: 0.72rem; color: #94a3b8; margin: 0; }

    .category-tag {
      background: #eff6ff; color: #2563eb; font-size: 0.72rem;
      font-weight: 600; padding: 2px 8px; border-radius: 20px;
    }
    .price-cell { display: flex; flex-direction: column; gap: 0.1rem; }
    .price { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
    .original { font-size: 0.72rem; color: #94a3b8; text-decoration: line-through; }

    .stock-edit { display: flex; align-items: center; gap: 0.4rem; }
    .stock-btn {
      width: 24px; height: 24px; border-radius: 6px;
      border: 1.5px solid #e2e8f0; background: white;
      font-size: 0.9rem; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .stock-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
    .stock-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .stock-val { font-size: 0.875rem; font-weight: 700; min-width: 28px; text-align: center; }
    .stock-val.low { color: #d97706; }
    .stock-val.out { color: #ef4444; }

    .badge { font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
    .badge.in { background: #f0fdf4; color: #16a34a; }
    .badge.low { background: #fffbeb; color: #d97706; }
    .badge.out { background: #fef2f2; color: #ef4444; }

    .action-btns { display: flex; gap: 0.4rem; }
    .action-btn {
      width: 30px; height: 30px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid #e2e8f0; background: white;
      cursor: pointer; text-decoration: none; color: #64748b;
      transition: all 0.15s;
    }
    .action-btn.edit:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
    .action-btn.view:hover { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }
    .action-btn.delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

    .empty-table { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
  `],
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);

  protected readonly products = signal<Product[]>([]);
  protected readonly filtered = signal<Product[]>([]);
  protected searchQuery    = '';
  protected filterCategory = '';
  protected filterStock    = '';

  async ngOnInit(): Promise<void> {
    const all = await this.productService.getAll();
    this.products.set(all);
    this.filtered.set(all);
  }

  protected applyFilter(): void {
    let result = this.products();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q));
    }
    if (this.filterCategory) result = result.filter((p) => p.category === this.filterCategory);
    if (this.filterStock === 'in')  result = result.filter((p) => p.stock > 5);
    if (this.filterStock === 'low') result = result.filter((p) => p.stock > 0 && p.stock <= 5);
    if (this.filterStock === 'out') result = result.filter((p) => p.stock === 0);
    this.filtered.set(result);
  }

  protected async adjustStock(product: Product, delta: number): Promise<void> {
    const newStock = Math.max(0, product.stock + delta);
    const updated  = { ...product, stock: newStock };
    await this.productService.upsert(updated);
    this.products.update((list) => list.map((p) => p.id === product.id ? updated : p));
    this.applyFilter();
  }

  protected async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`ลบ "${product.name}" ออกจากระบบ?`)) return;
    await this.productService.delete(product.id);
    this.products.update((list) => list.filter((p) => p.id !== product.id));
    this.applyFilter();
  }

  protected getImage(p: Product): string { return primaryImage(p)?.url ?? ''; }

  protected categoryLabel(cat: string): string {
    const map: Record<string, string> = {
      electronics: 'อิเล็กทรอนิกส์', clothing: 'เสื้อผ้า',
      home: 'ของใช้ในบ้าน', accessories: 'เครื่องประดับ',
    };
    return map[cat] ?? cat;
  }
}
