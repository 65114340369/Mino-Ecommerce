import {
  Component,
  inject,
  ElementRef,
  HostListener,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { primaryImage } from '../../models/product.model';

@Component({
  selector: 'app-search-bar',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="search-wrap" [class.active]="search.isOpen()">
      <!-- Input -->
      <div class="search-input-row">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <input
          #inputEl
          type="search"
          class="search-input"
          placeholder="ค้นหาสินค้า..."
          autocomplete="off"
          [value]="search.query()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (keydown.escape)="search.clear()"
          (keydown.enter)="onEnter()"
          aria-label="ค้นหาสินค้า"
          aria-autocomplete="list"
          [attr.aria-expanded]="search.isOpen()"
        />

        @if (search.isSearching()) {
          <span class="spinner" aria-label="กำลังค้นหา"></span>
        } @else if (search.query()) {
          <button class="clear-btn" (click)="search.clear()" aria-label="ล้างการค้นหา">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }
      </div>

      <!-- Dropdown -->
      @if (search.isOpen()) {
        <div class="dropdown" role="listbox" aria-label="ผลการค้นหา">
          @if (search.isSearching()) {
            <div class="dropdown-state">
              <span class="skeleton-row"></span>
              <span class="skeleton-row short"></span>
              <span class="skeleton-row"></span>
            </div>
          } @else if (search.results().length === 0 && search.query().trim()) {
            <div class="dropdown-state empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>ไม่พบสินค้า "<strong>{{ search.query() }}</strong>"</p>
            </div>
          } @else {
            <ul class="result-list">
              @for (result of search.results(); track result.product.id) {
                <li class="result-item" role="option">
                  <a
                    [routerLink]="['/products', result.product.id]"
                    class="result-link"
                    (click)="search.clear()"
                  >
                    <img
                      [src]="getImage(result.product)"
                      [alt]="result.product.name"
                      class="result-thumb"
                      loading="lazy"
                    />
                    <div class="result-info">
                      <span class="result-name"
                        [innerHTML]="highlight(result.product.name, search.query())">
                      </span>
                      <div class="result-meta">
                        <span class="result-category">{{ categoryLabel(result.product.category) }}</span>
                        @for (field of result.matchedFields; track field) {
                          @if (field !== 'name') {
                            <span class="match-badge">{{ fieldLabel(field) }}</span>
                          }
                        }
                      </div>
                    </div>
                    <div class="result-price">
                      <span class="price">฿{{ result.product.price.toLocaleString() }}</span>
                      @if (result.product.stock === 0) {
                        <span class="out-badge">หมด</span>
                      }
                    </div>
                  </a>
                </li>
              }
            </ul>

            @if (search.results().length > 0) {
              <div class="dropdown-footer">
                <a
                  routerLink="/products"
                  [queryParams]="{ q: search.query() }"
                  class="see-all-link"
                  (click)="search.clear()"
                >
                  ดูผลลัพธ์ทั้งหมดสำหรับ "{{ search.query() }}" →
                </a>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search-wrap {
      position: relative;
      width: 280px;
      transition: width 0.2s;
    }
    .search-wrap.active { width: 340px; }

    .search-input-row {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      border: 1.5px solid transparent;
      border-radius: 10px;
      padding: 0 0.75rem;
      gap: 0.5rem;
      transition: border-color 0.2s, background 0.2s;
    }
    .search-wrap.active .search-input-row,
    .search-input-row:focus-within {
      background: white;
      border-color: #6366f1;
    }
    .search-icon { color: #999; flex-shrink: 0; }
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.55rem 0;
      font-size: 0.875rem;
      color: #111;
      outline: none;
      min-width: 0;
    }
    .search-input::placeholder { color: #bbb; }
    .search-input::-webkit-search-cancel-button { display: none; }

    .clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #bbb;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.2s;
    }
    .clear-btn:hover { color: #666; }

    /* Spinner */
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #e5e5e5;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Dropdown */
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #f0f0f0;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      overflow: hidden;
      z-index: 300;
      animation: fadeDown 0.15s ease;
    }
    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Skeleton loading */
    .dropdown-state {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .skeleton-row {
      display: block;
      height: 14px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      border-radius: 6px;
      animation: shimmer 1.2s infinite;
    }
    .skeleton-row.short { width: 60%; }
    @keyframes shimmer {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }

    /* Empty state */
    .dropdown-state.empty {
      align-items: center;
      padding: 2rem 1rem;
      gap: 0.75rem;
      color: #999;
      font-size: 0.875rem;
      text-align: center;
    }
    .dropdown-state.empty strong { color: #333; }

    /* Results */
    .result-list { list-style: none; margin: 0; padding: 0.5rem 0; }
    .result-item {}
    .result-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 1rem;
      text-decoration: none;
      transition: background 0.15s;
    }
    .result-link:hover { background: #faf9ff; }

    .result-thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      background: #f5f5f5;
      flex-shrink: 0;
    }
    .result-info { flex: 1; min-width: 0; }
    .result-name {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #111;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Highlight matched text */
    :host ::ng-deep .result-name mark {
      background: #ede9fe;
      color: #6366f1;
      border-radius: 2px;
      padding: 0 1px;
      font-weight: 700;
    }
    .result-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.2rem;
      flex-wrap: wrap;
    }
    .result-category {
      font-size: 0.7rem;
      color: #999;
    }
    .match-badge {
      font-size: 0.65rem;
      background: #f0fdf4;
      color: #16a34a;
      padding: 1px 6px;
      border-radius: 10px;
      font-weight: 600;
    }
    .result-price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.2rem;
      flex-shrink: 0;
    }
    .price { font-size: 0.875rem; font-weight: 700; color: #111; }
    .out-badge {
      font-size: 0.65rem;
      background: #fef2f2;
      color: #ef4444;
      padding: 1px 6px;
      border-radius: 10px;
      font-weight: 600;
    }

    .dropdown-footer {
      border-top: 1px solid #f5f5f5;
      padding: 0.6rem 1rem;
    }
    .see-all-link {
      font-size: 0.8rem;
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
    }
    .see-all-link:hover { text-decoration: underline; }

    @media (max-width: 640px) {
      .search-wrap, .search-wrap.active { width: 100%; }
    }
  `],
})
export class SearchBarComponent {
  protected readonly search = inject(SearchService);
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.search(value);
  }

  protected onFocus(): void {
    if (this.search.query().trim()) {
      this.search.isOpen.set(true);
    }
  }

  protected onEnter(): void {
    this.search.close();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const el = (event.target as HTMLElement);
    if (!el.closest('app-search-bar')) {
      this.search.close();
    }
  }

  protected getImage(product: Parameters<typeof primaryImage>[0]): string {
    return primaryImage(product)?.url ?? '';
  }

  protected highlight(text: string, query: string): string {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  protected categoryLabel(cat: string): string {
    const map: Record<string, string> = {
      electronics: 'อิเล็กทรอนิกส์',
      clothing: 'เสื้อผ้า',
      home: 'ของใช้ในบ้าน',
      accessories: 'เครื่องประดับ',
    };
    return map[cat] ?? cat;
  }

  protected fieldLabel(field: string): string {
    const map: Record<string, string> = {
      tags: 'แท็ก',
      description: 'รายละเอียด',
      category: 'หมวดหมู่',
    };
    return map[field] ?? field;
  }
}
