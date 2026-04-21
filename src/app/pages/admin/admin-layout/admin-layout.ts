import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-shell">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-header">
          <a routerLink="/admin" class="admin-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            @if (!collapsed()) { <span>MINO Admin</span> }
          </a>
          <button class="collapse-btn" (click)="collapsed.update(v => !v)" aria-label="toggle sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <nav class="admin-nav">
          @for (item of navItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="nav-item" [title]="item.label">
              <span class="nav-icon" [innerHTML]="item.icon"></span>
              @if (!collapsed()) { <span class="nav-label">{{ item.label }}</span> }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="nav-item" title="กลับหน้าร้าน">
            <span class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            @if (!collapsed()) { <span class="nav-label">กลับหน้าร้าน</span> }
          </a>
          <button class="nav-item logout" (click)="auth.logout()" title="ออกจากระบบ">
            <span class="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            @if (!collapsed()) { <span class="nav-label">ออกจากระบบ</span> }
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="admin-main">
        <header class="admin-topbar">
          <div class="topbar-left">
            <span class="topbar-title">Admin Panel</span>
          </div>
          <div class="topbar-right">
            <span class="admin-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {{ auth.currentUser()?.email }}
            </span>
          </div>
        </header>
        <div class="admin-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* Sidebar */
    .admin-sidebar {
      width: 220px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.2s;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
    }
    .admin-sidebar.collapsed { width: 60px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid #1e293b;
    }
    .admin-brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      color: white;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
    }
    .collapse-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .collapse-btn:hover { color: white; }

    .admin-nav {
      flex: 1;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .nav-item:hover { background: #1e293b; color: #e2e8f0; }
    .nav-item.active { background: #2563eb; color: white; }
    .nav-item.logout:hover { background: #450a0a; color: #fca5a5; }
    .nav-icon { display: flex; align-items: center; flex-shrink: 0; }
    .nav-label { overflow: hidden; }

    .sidebar-footer {
      padding: 0.75rem 0.5rem;
      border-top: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    /* Main */
    .admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .admin-topbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1.5rem;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .topbar-title { font-size: 0.875rem; font-weight: 700; color: #64748b; }
    .admin-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: #64748b;
      background: #f1f5f9;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
    }
    .admin-content { padding: 1.5rem; flex: 1; }

    @media (max-width: 768px) {
      .admin-sidebar { width: 60px; }
      .nav-label, .admin-brand span { display: none; }
    }
  `],
})
export class AdminLayoutComponent {
  protected readonly auth      = inject(AuthService);
  protected readonly collapsed = signal(false);

  protected readonly navItems = [
    {
      path: '/admin',
      exact: true,
      label: 'ภาพรวม',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    },
    {
      path: '/admin/products',
      label: 'สินค้า',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    },
    {
      path: '/admin/orders',
      label: 'คำสั่งซื้อ',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    },
    {
      path: '/admin/members',
      label: 'สมาชิก',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
  ];
}
