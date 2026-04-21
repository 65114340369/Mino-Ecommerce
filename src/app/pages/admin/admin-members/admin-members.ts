import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';

const KEY_USERS  = 'mino_users';
const KEY_ORDERS = 'mino_orders';

@Component({
  selector: 'app-admin-members',
  imports: [FormsModule],
  template: `
    <div class="members-page">
      <div class="page-header">
        <div>
          <h1>จัดการสมาชิก</h1>
          <p>{{ filtered().length }} บัญชี</p>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" [(ngModel)]="searchQuery" (ngModelChange)="applyFilter()"
            placeholder="ค้นหาชื่อหรืออีเมล..." class="search-input" />
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>สมาชิก</th>
              <th>อีเมล</th>
              <th>เบอร์โทร</th>
              <th>คำสั่งซื้อ</th>
              <th>สมัครเมื่อ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            @for (user of filtered(); track user.id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">
                      @if (user.avatar) {
                        <img [src]="user.avatar" [alt]="user.firstName" />
                      } @else {
                        {{ (user.firstName || user.email).charAt(0).toUpperCase() }}
                      }
                    </div>
                    <div>
                      <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
                      <p class="user-id">ID: {{ user.id.slice(0, 8) }}...</p>
                    </div>
                  </div>
                </td>
                <td><span class="email">{{ user.email }}</span></td>
                <td><span class="phone">{{ user.phone || '—' }}</span></td>
                <td>
                  <span class="order-count">{{ orderCount(user.id) }} รายการ</span>
                </td>
                <td><span class="date">{{ formatDate(user.createdAt) }}</span></td>
                <td>
                  <button class="action-btn delete" (click)="deleteUser(user)"
                    title="ลบบัญชี" [disabled]="isAdmin(user.email)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filtered().length === 0) {
          <div class="empty-table">ไม่พบสมาชิก</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .members-page { max-width: 1000px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-header p { font-size: 0.8rem; color: #94a3b8; margin: 0; }

    .toolbar { margin-bottom: 1.25rem; }
    .search-wrap {
      display: flex; align-items: center; gap: 0.5rem;
      background: white; border: 1.5px solid #e2e8f0; border-radius: 8px;
      padding: 0 0.75rem; max-width: 360px;
    }
    .search-input { border: none; outline: none; font-size: 0.875rem; padding: 0.55rem 0; width: 100%; }

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

    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: #2563eb; color: white;
      font-size: 0.875rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
    }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-name { font-size: 0.875rem; font-weight: 600; color: #0f172a; margin: 0 0 0.15rem; }
    .user-id { font-size: 0.7rem; color: #94a3b8; margin: 0; font-family: monospace; }
    .email { font-size: 0.8rem; color: #475569; }
    .phone { font-size: 0.8rem; color: #64748b; }
    .order-count { font-size: 0.8rem; font-weight: 600; color: #0f172a; }
    .date { font-size: 0.78rem; color: #64748b; }

    .action-btn {
      width: 30px; height: 30px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid #e2e8f0; background: white;
      cursor: pointer; color: #64748b; transition: all 0.15s;
    }
    .action-btn.delete:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
    .action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .empty-table { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
  `],
})
export class AdminMembersComponent implements OnInit {
  protected readonly users    = signal<User[]>([]);
  protected readonly filtered = signal<User[]>([]);
  protected searchQuery = '';
  private allOrders: any[] = [];

  ngOnInit(): void {
    try {
      const users = JSON.parse(localStorage.getItem(KEY_USERS) ?? '[]') as User[];
      this.users.set(users.sort((a, b) => b.createdAt - a.createdAt));
      this.filtered.set(this.users());
      this.allOrders = JSON.parse(localStorage.getItem(KEY_ORDERS) ?? '[]');
    } catch { this.users.set([]); }
  }

  protected applyFilter(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered.set(
      q ? this.users().filter((u) =>
        u.email.includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
      ) : this.users()
    );
  }

  protected orderCount(userId: string): number {
    return this.allOrders.filter((o: any) => o.userId === userId).length;
  }

  protected isAdmin(email: string): boolean {
    return email === 'admin@mino.shop';
  }

  protected deleteUser(user: User): void {
    if (!confirm(`ลบบัญชี "${user.email}" ออกจากระบบ?`)) return;
    const updated = this.users().filter((u) => u.id !== user.id);
    localStorage.setItem(KEY_USERS, JSON.stringify(updated));
    this.users.set(updated);
    this.applyFilter();
  }

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
