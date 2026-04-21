import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../../models/user.model';

const KEY_ORDERS = 'mino_orders';

@Component({
  selector: 'app-admin-orders',
  imports: [FormsModule],
  template: `
    <div class="orders-page">
      <div class="page-header">
        <div>
          <h1>คำสั่งซื้อ</h1>
          <p>{{ filtered().length }} รายการ</p>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="status-tabs">
        @for (tab of statusTabs; track tab.value) {
          <button class="status-tab" [class.active]="filterStatus === tab.value"
            (click)="filterStatus = tab.value; applyFilter()">
            {{ tab.label }}
            <span class="tab-count">{{ countByStatus(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- Table -->
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>หมายเลข</th>
              <th>วันที่</th>
              <th>รายการ</th>
              <th>ยอดรวม</th>
              <th>ชำระ</th>
              <th>สถานะ</th>
              <th>อัปเดต</th>
            </tr>
          </thead>
          <tbody>
            @for (order of filtered(); track order.id) {
              <tr>
                <td><span class="order-id">{{ order.id }}</span></td>
                <td><span class="date">{{ formatDate(order.createdAt) }}</span></td>
                <td>
                  <div class="items-preview">
                    @for (item of order.items.slice(0, 2); track item.productId) {
                      <img [src]="item.productImage" [alt]="item.productName" class="item-thumb" [title]="item.productName" />
                    }
                    @if (order.items.length > 2) {
                      <span class="more">+{{ order.items.length - 2 }}</span>
                    }
                    <span class="item-count">{{ order.items.length }} รายการ</span>
                  </div>
                </td>
                <td><span class="total">฿{{ order.total.toLocaleString() }}</span></td>
                <td><span class="payment">{{ paymentLabel(order.paymentMethod) }}</span></td>
                <td>
                  <span class="status-badge"
                    [style.background]="statusColor(order.status) + '18'"
                    [style.color]="statusColor(order.status)">
                    {{ statusLabel(order.status) }}
                  </span>
                </td>
                <td>
                  <select class="status-select" [value]="order.status"
                    (change)="updateStatus(order, $any($event.target).value)">
                    <option value="pending">รอดำเนินการ</option>
                    <option value="preparing">กำลังเตรียมการ</option>
                    <option value="shipped">อยู่ระหว่างขนส่ง</option>
                    <option value="delivered">จัดส่งสำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filtered().length === 0) {
          <div class="empty-table">ไม่มีคำสั่งซื้อ</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .orders-page { max-width: 1100px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-header p { font-size: 0.8rem; color: #94a3b8; margin: 0; }

    .status-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .status-tab {
      padding: 0.45rem 0.875rem; border-radius: 8px;
      border: 1.5px solid #e2e8f0; background: white;
      font-size: 0.8rem; font-weight: 600; color: #64748b;
      cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
      transition: all 0.15s;
    }
    .status-tab:hover { border-color: #2563eb; color: #2563eb; }
    .status-tab.active { background: #2563eb; border-color: #2563eb; color: white; }
    .tab-count {
      background: rgba(255,255,255,0.25);
      padding: 1px 6px; border-radius: 10px; font-size: 0.7rem;
    }
    .status-tab:not(.active) .tab-count { background: #f1f5f9; color: #64748b; }

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

    .order-id { font-size: 0.8rem; font-weight: 700; color: #0f172a; font-family: monospace; }
    .date { font-size: 0.78rem; color: #64748b; }
    .items-preview { display: flex; align-items: center; gap: 0.35rem; }
    .item-thumb { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; background: #f1f5f9; }
    .more { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
    .item-count { font-size: 0.75rem; color: #94a3b8; margin-left: 0.25rem; }
    .total { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
    .payment { font-size: 0.78rem; color: #64748b; }
    .status-badge { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
    .status-select {
      padding: 0.35rem 0.625rem; border: 1.5px solid #e2e8f0;
      border-radius: 6px; font-size: 0.78rem; background: white;
      color: #334155; cursor: pointer;
    }
    .empty-table { text-align: center; padding: 3rem; color: #94a3b8; font-size: 0.875rem; }
  `],
})
export class AdminOrdersComponent implements OnInit {
  protected readonly orders   = signal<Order[]>([]);
  protected readonly filtered = signal<Order[]>([]);
  protected filterStatus = '';

  protected readonly statusTabs = [
    { label: 'ทั้งหมด',           value: '' },
    { label: 'รอดำเนินการ',       value: 'pending' },
    { label: 'กำลังเตรียมการ',    value: 'preparing' },
    { label: 'อยู่ระหว่างขนส่ง', value: 'shipped' },
    { label: 'จัดส่งสำเร็จ',     value: 'delivered' },
    { label: 'ยกเลิก',           value: 'cancelled' },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    try {
      const all = JSON.parse(localStorage.getItem(KEY_ORDERS) ?? '[]') as Order[];
      const sorted = all.sort((a, b) => b.createdAt - a.createdAt);
      this.orders.set(sorted);
      this.applyFilter();
    } catch { this.orders.set([]); }
  }

  protected applyFilter(): void {
    const all = this.orders();
    this.filtered.set(this.filterStatus ? all.filter((o) => o.status === this.filterStatus) : all);
  }

  protected countByStatus(status: string): number {
    const all = this.orders();
    return status ? all.filter((o) => o.status === status).length : all.length;
  }

  protected updateStatus(order: Order, newStatus: OrderStatus): void {
    const updated: Order = {
      ...order,
      status: newStatus,
      statusHistory: [...order.statusHistory, { status: newStatus, timestamp: Date.now() }],
      updatedAt: Date.now(),
    };
    const all = this.orders().map((o) => o.id === order.id ? updated : o);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(all));
    this.orders.set(all);
    this.applyFilter();
  }

  protected statusLabel(s: OrderStatus): string { return ORDER_STATUS_LABEL[s]; }
  protected statusColor(s: OrderStatus): string { return ORDER_STATUS_COLOR[s]; }

  protected paymentLabel(m: string): string {
    const map: Record<string, string> = {
      promptpay: 'พร้อมเพย์', credit: 'บัตรเครดิต',
      bank: 'โอนเงิน', cod: 'ปลายทาง',
    };
    return map[m] ?? m;
  }

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
