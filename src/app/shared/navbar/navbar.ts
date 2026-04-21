import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SearchBarComponent],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">MINO<span>.</span></a>

        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            {{ i18n.t('nav.home') }}
          </a></li>
          <li><a routerLink="/products" routerLinkActive="active">
            {{ i18n.t('nav.products') }}
          </a></li>
        </ul>

        <div class="nav-center">
          <app-search-bar />
        </div>

        <div class="nav-actions">
          <!-- Auth -->
          @if (auth.isLoggedIn()) {
            <a routerLink="/dashboard" class="user-btn" [title]="auth.displayName()" aria-label="บัญชีของฉัน">
              <div class="user-avatar">
                @if (auth.currentUser()?.avatar) {
                  <img [src]="auth.currentUser()!.avatar" alt="avatar" class="user-avatar-img" />
                } @else {
                  {{ auth.displayName().charAt(0).toUpperCase() }}
                }
              </div>
            </a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="admin-link" title="Admin Panel">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </a>
            }
          } @else {
            <a routerLink="/login" class="login-btn">{{ i18n.t('nav.login') }}</a>
          }

          <!-- Language Switcher Drawer -->
          <div class="lang-wrap" [class.open]="langOpen()">
            <button class="lang-trigger" (click)="langOpen.update(v => !v)"
              [attr.aria-expanded]="langOpen()" aria-label="เลือกภาษา">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span class="lang-current">{{ i18n.lang() === 'th' ? 'ไทย' : 'EN' }}</span>
              <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            @if (langOpen()) {
              <div class="lang-drawer" role="menu">
                <button class="lang-option" [class.active]="i18n.lang() === 'th'"
                  (click)="selectLang('th')" role="menuitem">
                  <span class="flag">🇹🇭</span>
                  <span>ภาษาไทย</span>
                  @if (i18n.lang() === 'th') {
                    <svg class="check" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  }
                </button>
                <button class="lang-option" [class.active]="i18n.lang() === 'en'"
                  (click)="selectLang('en')" role="menuitem">
                  <span class="flag">🇬🇧</span>
                  <span>English</span>
                  @if (i18n.lang() === 'en') {
                    <svg class="check" xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  }
                </button>
              </div>
            }
          </div>

          <!-- Cart -->
          <a routerLink="/checkout" class="cart-btn" aria-label="ตะกร้าสินค้า">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            @if (cart.totalCount() > 0) {
              <span class="cart-badge">{{ cart.totalCount() }}</span>
            }
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--clr-border);
    }
    .nav-container {
      max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
      height: 64px;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-center { display: flex; justify-content: center; }
    .nav-brand {
      font-size: 1.5rem; font-weight: 800;
      letter-spacing: -0.05em; color: var(--clr-text); text-decoration: none;
    }
    .nav-brand span { color: var(--clr-accent); }
    .nav-links {
      display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0;
    }
    .nav-links a {
      text-decoration: none; color: var(--clr-muted);
      font-size: 0.875rem; font-weight: 500; transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active { color: var(--clr-text); }
    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }

    /* Login */
    .login-btn {
      font-size: 0.8rem; font-weight: 600; color: var(--clr-accent);
      text-decoration: none; padding: 0.4rem 0.875rem;
      border: 1.5px solid var(--clr-accent); border-radius: 8px;
      transition: background 0.2s, color 0.2s; white-space: nowrap;
    }
    .login-btn:hover { background: var(--clr-accent); color: white; }

    /* User avatar */
    .user-btn { text-decoration: none; }
    .user-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--clr-accent); color: white;
      font-size: 0.8rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s; overflow: hidden; flex-shrink: 0;
    }
    .user-avatar:has(.user-avatar-img) { background: transparent; }
    .user-avatar-img { width: 32px; height: 32px; object-fit: cover; border-radius: 50%; display: block; }
    .user-btn:hover .user-avatar { opacity: 0.85; }

    /* Admin */
    .admin-link {
      display: flex; align-items: center;
      color: #f59e0b; padding: 0.4rem;
      text-decoration: none; transition: opacity 0.2s;
    }
    .admin-link:hover { opacity: 0.75; }

    /* ── Language Drawer ── */
    .lang-wrap {
      position: relative;
    }
    .lang-trigger {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--clr-muted);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.5rem;
      border-radius: 8px;
      transition: background 0.2s, color 0.2s;
    }
    .lang-trigger:hover,
    .lang-wrap.open .lang-trigger {
      background: var(--clr-surface);
      color: var(--clr-text);
    }
    .lang-current { letter-spacing: 0.02em; }
    .chevron {
      transition: transform 0.2s;
    }
    .lang-wrap.open .chevron { transform: rotate(180deg); }

    .lang-drawer {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border: 1px solid var(--clr-border);
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.10);
      overflow: hidden;
      min-width: 150px;
      animation: fadeDown 0.15s ease;
      z-index: 200;
    }
    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .lang-option {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      width: 100%;
      padding: 0.7rem 1rem;
      border: none;
      background: white;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--clr-subtle);
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .lang-option:hover { background: var(--clr-surface); }
    .lang-option.active { color: var(--clr-accent); font-weight: 700; }
    .lang-option + .lang-option { border-top: 1px solid var(--clr-border); }
    .flag { font-size: 1.1rem; }
    .check { margin-left: auto; color: var(--clr-accent); }

    /* Cart */
    .cart-btn {
      position: relative; display: flex; align-items: center;
      color: var(--clr-text); text-decoration: none; padding: 0.4rem;
      transition: color 0.2s;
    }
    .cart-btn:hover { color: var(--clr-accent); }
    .cart-badge {
      position: absolute; top: -4px; right: -4px;
      background: var(--clr-accent); color: white;
      font-size: 0.65rem; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }

    @media (max-width: 640px) {
      .nav-links { display: none; }
      .nav-container { grid-template-columns: auto 1fr auto; }
      .nav-center { display: none; }
      .login-btn { display: none; }
    }
  `],
})
export class NavbarComponent {
  protected readonly cart    = inject(CartService);
  protected readonly auth    = inject(AuthService);
  protected readonly i18n    = inject(I18nService);
  protected readonly langOpen = signal(false);

  protected selectLang(lang: 'th' | 'en'): void {
    this.i18n.setLang(lang);
    this.langOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('.lang-wrap')) {
      this.langOpen.set(false);
    }
  }
}
