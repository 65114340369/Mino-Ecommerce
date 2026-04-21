import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, ShippingAddress, Order, OrderItem, OrderStatus } from '../models/user.model';
import { CartItem, primaryImage } from '../models/product.model';
import { environment } from '../../environments/environment';

// ── localStorage keys ─────────────────────────────────────────────────────────
const KEY_SESSION  = 'mino_uid';
const KEY_USERS    = 'mino_users';
const KEY_ORDERS   = 'mino_orders';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);

  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => this._user() !== null);
  readonly displayName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}`.trim() || u.email : '';
  });
  readonly isAdmin = computed(() => {
    const u = this._user();
    if (!u) return false;
    return environment.adminEmails.includes(u.email.toLowerCase());
  });

  constructor() {
    this.restoreSession();
  }

  // ── localStorage helpers ──────────────────────────────────────────────────────

  private getUsers(): User[] {
    try { return JSON.parse(localStorage.getItem(KEY_USERS) ?? '[]'); }
    catch { return []; }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }

  private loadOrders(): Order[] {
    try { return JSON.parse(localStorage.getItem(KEY_ORDERS) ?? '[]'); }
    catch { return []; }
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  }

  // ── Session ───────────────────────────────────────────────────────────────────

  private restoreSession(): void {
    const uid = localStorage.getItem(KEY_SESSION);
    if (!uid) return;
    const user = this.getUsers().find((u) => u.id === uid) ?? null;
    this._user.set(user);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────────

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ): Promise<{ success: boolean; error?: string }> {
    const users = this.getUsers();
    if (users.find((u) => u.email === email.toLowerCase())) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    const user: User = {
      id:           crypto.randomUUID(),
      email:        email.toLowerCase(),
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      phone,
      addresses:    [],
      createdAt:    Date.now(),
      updatedAt:    Date.now(),
    };

    this.saveUsers([...users, user]);
    this._user.set(user);
    localStorage.setItem(KEY_SESSION, user.id);
    return { success: true };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    const user = this.getUsers().find((u) => u.email === email.toLowerCase());
    if (!user) return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้' };

    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };

    this._user.set(user);
    localStorage.setItem(KEY_SESSION, user.id);
    return { success: true };
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(KEY_SESSION);
    this.router.navigate(['/']);
  }

  // ── Google Login ──────────────────────────────────────────────────────────────

  async loginWithGoogle(credential: string): Promise<{ success: boolean; error?: string }> {
    try {
      const decoded = decodeGoogleJwt(credential);
      const users   = this.getUsers();
      let user      = users.find((u) => u.email === decoded.email.toLowerCase());

      // Auto-register if not exists
      if (!user) {
        user = {
          id:           crypto.randomUUID(),
          email:        decoded.email.toLowerCase(),
          passwordHash: '',  // Google users don't have password
          firstName:    decoded.given_name || '',
          lastName:     decoded.family_name || '',
          phone:        '',
          addresses:    [],
          createdAt:    Date.now(),
          updatedAt:    Date.now(),
        };
        this.saveUsers([...users, user]);
      }

      this._user.set(user);
      localStorage.setItem(KEY_SESSION, user.id);
      return { success: true };
    } catch (err) {
      console.error('[Auth] Google login error:', err);
      return { success: false, error: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ' };
    }
  }

  // ── Profile ───────────────────────────────────────────────────────────────────

  async updateProfile(patch: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatar'>>): Promise<void> {
    const user = this._user();
    if (!user) return;
    const updated = { ...user, ...patch, updatedAt: Date.now() };
    const users = this.getUsers().map((u) => u.id === updated.id ? updated : u);
    this.saveUsers(users);
    this._user.set(updated);
  }

  async upsertAddress(addr: ShippingAddress): Promise<void> {
    const user = this._user();
    if (!user) return;
    let addresses = user.addresses.filter((a) => a.id !== addr.id);
    if (addr.isDefault) addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    addresses.push(addr);
    const updated = { ...user, addresses, updatedAt: Date.now() };
    const users = this.getUsers().map((u) => u.id === updated.id ? updated : u);
    this.saveUsers(users);
    this._user.set(updated);
  }

  async deleteAddress(id: string): Promise<void> {
    const user = this._user();
    if (!user) return;
    const updated = { ...user, addresses: user.addresses.filter((a) => a.id !== id), updatedAt: Date.now() };
    const users = this.getUsers().map((u) => u.id === updated.id ? updated : u);
    this.saveUsers(users);
    this._user.set(updated);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this._user();
    if (!user) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' };
    if (!user.passwordHash) return { success: false, error: 'บัญชี Google ไม่สามารถเปลี่ยนรหัสผ่านได้' };

    const currentHash = await hashPassword(currentPassword);
    if (currentHash !== user.passwordHash) return { success: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };

    const newHash = await hashPassword(newPassword);
    const updated = { ...user, passwordHash: newHash, updatedAt: Date.now() };
    const users = this.getUsers().map((u) => u.id === updated.id ? updated : u);
    this.saveUsers(users);
    this._user.set(updated);
    return { success: true };
  }

  // ── Orders ────────────────────────────────────────────────────────────────────

  async getOrders(): Promise<Order[]> {
    const user = this._user();
    if (!user) return [];
    return this.loadOrders()
      .filter((o) => o.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async createOrder(
    cartItems: CartItem[],
    subtotal: number,
    shipping: number,
    paymentMethod: string,
    shippingAddress: ShippingAddress,
  ): Promise<Order> {
    const userId = this._user()?.id ?? 'guest';

    const items: OrderItem[] = cartItems.map((ci) => ({
      productId:    ci.product.id,
      productName:  ci.product.name,
      productImage: primaryImage(ci.product)?.url ?? '',
      price:        ci.product.price,
      quantity:     ci.quantity,
    }));

    const order: Order = {
      id:            `ORD-${Math.floor(Math.random() * 900000 + 100000)}`,
      userId,
      items,
      subtotal,
      shipping,
      total:         subtotal + shipping,
      paymentMethod,
      shippingAddress,
      status:        'preparing',
      statusHistory: [{ status: 'preparing', timestamp: Date.now() }],
      createdAt:     Date.now(),
      updatedAt:     Date.now(),
    };

    this.saveOrders([...this.loadOrders(), order]);
    this.scheduleDemoProgression(order.id);
    return order;
  }

  private scheduleDemoProgression(orderId: string): void {
    const steps: { status: OrderStatus; delay: number }[] = [
      { status: 'shipped',   delay: 8_000  },
      { status: 'delivered', delay: 20_000 },
    ];
    steps.forEach(({ status, delay }) => {
      setTimeout(() => {
        const orders = this.loadOrders();
        const idx    = orders.findIndex((o) => o.id === orderId);
        if (idx === -1 || orders[idx].status === 'cancelled') return;
        orders[idx] = {
          ...orders[idx],
          status,
          statusHistory: [...orders[idx].statusHistory, { status, timestamp: Date.now() }],
          updatedAt: Date.now(),
        };
        this.saveOrders(orders);
      }, delay);
    });
  }

  // ── Demo seed ─────────────────────────────────────────────────────────────────

  async seedDemoOrders(userId: string): Promise<void> {
    const existing = this.loadOrders().filter((o) => o.userId === userId);
    if (existing.length > 0) return;

    const now = Date.now();
    const demos: Order[] = [
      {
        id: 'ORD-100001', userId,
        items: [
          { productId: 2, productName: 'Wireless Noise-Cancel Headphones', productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80', price: 3490, quantity: 1 },
          { productId: 7, productName: 'Linen Tote Bag', productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&q=80', price: 490, quantity: 2 },
        ],
        subtotal: 4470, shipping: 0, total: 4470, paymentMethod: 'credit',
        shippingAddress: { id: 'a1', label: 'บ้าน', address: '123 ถนนสุขุมวิท', district: 'คลองเตย', province: 'กรุงเทพมหานคร', postalCode: '10110', isDefault: true },
        status: 'delivered',
        statusHistory: [
          { status: 'preparing', timestamp: now - 86400000 * 7 },
          { status: 'shipped',   timestamp: now - 86400000 * 5 },
          { status: 'delivered', timestamp: now - 86400000 * 3 },
        ],
        createdAt: now - 86400000 * 7, updatedAt: now - 86400000 * 3,
      },
      {
        id: 'ORD-100002', userId,
        items: [
          { productId: 1, productName: 'Minimal Leather Wallet', productImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80', price: 890, quantity: 1 },
        ],
        subtotal: 890, shipping: 50, total: 940, paymentMethod: 'promptpay',
        shippingAddress: { id: 'a1', label: 'บ้าน', address: '123 ถนนสุขุมวิท', district: 'คลองเตย', province: 'กรุงเทพมหานคร', postalCode: '10110', isDefault: true },
        status: 'shipped',
        statusHistory: [
          { status: 'preparing', timestamp: now - 86400000 * 2 },
          { status: 'shipped',   timestamp: now - 86400000 },
        ],
        createdAt: now - 86400000 * 2, updatedAt: now - 86400000,
      },
      {
        id: 'ORD-100003', userId,
        items: [
          { productId: 3, productName: 'Ceramic Pour-Over Coffee Set', productImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80', price: 1290, quantity: 1 },
          { productId: 9, productName: 'Scented Soy Candle Set', productImage: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=200&q=80', price: 780, quantity: 1 },
        ],
        subtotal: 2070, shipping: 0, total: 2070, paymentMethod: 'bank',
        shippingAddress: { id: 'a1', label: 'บ้าน', address: '123 ถนนสุขุมวิท', district: 'คลองเตย', province: 'กรุงเทพมหานคร', postalCode: '10110', isDefault: true },
        status: 'preparing',
        statusHistory: [{ status: 'preparing', timestamp: now - 3600000 }],
        createdAt: now - 3600000, updatedAt: now - 3600000,
      },
    ];

    this.saveOrders([...this.loadOrders(), ...demos]);
  }
}

// ── Hash helper ───────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── Google JWT decoder (no library needed) ────────────────────────────────────

function decodeGoogleJwt(token: string): { email: string; name: string; given_name: string; family_name: string; picture: string; sub: string } {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  // Decode Base64 to string, then properly decode UTF-8 bytes to handle Thai characters
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}
