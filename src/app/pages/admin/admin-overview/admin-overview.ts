import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';

interface Stat { label: string; value: string; sub: string; icon: string; color: string; }

@Component({
  selector: 'app-admin-overview',
  imports: [RouterLink],
  template: `
    <div class="overview-page">
      <div class="page-header">
        <h1>ภาพรวม</h1>
        <p>{{ today }}</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card" [style.border-left-color]="stat.color">
            <div class="stat-icon" [style.background]="stat.color + '18'" [style.color]="stat.color"
              [innerHTML]="stat.icon"></div>
            <div class="stat-body">
              <p class="stat-label">{{ stat.label }}</p>
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-sub">{{ stat.sub }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <h2>ทางลัด</h2>
        <div class="action-grid">
          <a routerLink="/admin/products/new" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>เพิ่มสินค้าใหม่</span>
          </a>
          <a routerLink="/admin/orders" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>ดูคำสั่งซื้อ</span>
          </a>
          <a routerLink="/admin/members" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            <span>จัดการสมาชิก</span>
          </a>
          <a routerLink="/products" target="_blank" class="action-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>ดูหน้าร้าน</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-page { max-width: 1000px; }
    .page-header { margin-bottom: 1.75rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-header p { font-size: 0.8rem; color: #94a3b8; margin: 0; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      background: white; border-radius: 12px; padding: 1.25rem;
      border: 1px solid #e2e8f0; border-left: 4px solid;
      display: flex; align-items: flex-start; gap: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .stat-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 0.25rem; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .stat-sub { font-size: 0.72rem; color: #94a3b8; margin: 0; }

    .quick-actions h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 1rem; }
    .action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .action-card {
      background: white; border: 1.5px solid #e2e8f0; border-radius: 12px;
      padding: 1.25rem; display: flex; flex-direction: column;
      align-items: center; gap: 0.625rem; text-decoration: none;
      color: #475569; font-size: 0.8rem; font-weight: 600;
      transition: border-color 0.2s, color 0.2s, transform 0.15s;
      text-align: center;
    }
    .action-card:hover { border-color: #2563eb; color: #2563eb; transform: translateY(-2px); }

    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .action-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class AdminOverviewComponent implements OnInit {
  private readonly auth    = inject(AuthService);
  private readonly product = inject(ProductService);

  protected readonly stats = signal<Stat[]>([]);
  protected readonly today = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  async ngOnInit(): Promise<void> {
    const products = await this.product.getAll();
    const users    = this.getAllUsers();
    const orders   = this.getAllOrders();
    const revenue  = orders.reduce((s, o) => s + o.total, 0);
    const lowStock = products.filter((p) => p.stock <= 5).length;

    this.stats.set([
      {
        label: 'สินค้าทั้งหมด',
        value: products.length.toString(),
        sub: `สต็อกต่ำ ${lowStock} รายการ`,
        color: '#2563eb',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
      },
      {
        label: 'คำสั่งซื้อ',
        value: orders.length.toString(),
        sub: `จัดส่งแล้ว ${orders.filter(o => o.status === 'delivered').length} รายการ`,
        color: '#16a34a',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
      },
      {
        label: 'สมาชิก',
        value: users.length.toString(),
        sub: 'บัญชีที่ลงทะเบียน',
        color: '#7c3aed',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
      },
      {
        label: 'รายได้รวม',
        value: `฿${revenue.toLocaleString()}`,
        sub: 'จากทุกคำสั่งซื้อ',
        color: '#d97706',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
      },
    ]);
  }

  private getAllUsers(): any[] {
    try { return JSON.parse(localStorage.getItem('mino_users') ?? '[]'); } catch { return []; }
  }

  private getAllOrders(): any[] {
    try { return JSON.parse(localStorage.getItem('mino_orders') ?? '[]'); } catch { return []; }
  }
}
