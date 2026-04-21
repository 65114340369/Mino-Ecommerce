import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AddressFormComponent, AddressValue } from '../../shared/address-form/address-form';
import { primaryImage } from '../../models/product.model';
import type { Product } from '../../models/product.model';

interface AddressForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, AddressFormComponent, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <a routerLink="/products" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          กลับไปช้อปต่อ
        </a>
        <h1>{{ 'checkout.title' | t }}</h1>
      </div>

      @if (cart.cartItems().length === 0 && !orderPlaced()) {
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>ตะกร้าว่างเปล่า</h2>
          <p>เพิ่มสินค้าลงตะกร้าก่อนชำระเงิน</p>
          <a routerLink="/products" class="btn-primary">เลือกซื้อสินค้า</a>
        </div>

      } @else if (orderPlaced()) {
        <div class="order-success">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
              fill="none" stroke="white" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2>{{ 'checkout.success' | t }}</h2>
          <p>{{ i18n.lang() === 'en' ? 'Thank you for your order. We will ship it as soon as possible.' : 'ขอบคุณสำหรับการสั่งซื้อ เราจะจัดส่งสินค้าให้คุณโดยเร็วที่สุด' }}</p>
          <p class="order-number">{{ 'checkout.order_no' | t }}: <strong>#{{ orderNumber() }}</strong></p>
          <a routerLink="/" class="btn-primary">{{ 'checkout.home' | t }}</a>
        </div>

      } @else {
        <div class="checkout-layout">
          <!-- ── Left: Form ── -->
          <div class="checkout-form">

            <section class="form-section">
              <h2 class="section-title">
                <span class="step-num">1</span>{{ 'checkout.address' | t }}
              </h2>
              <div class="form-grid" style="margin-bottom:1rem">
                <div class="form-group">
                  <label for="firstName">ชื่อ <span class="required">*</span></label>
                  <input id="firstName" type="text" [(ngModel)]="form.firstName"
                    placeholder="ชื่อจริง" autocomplete="given-name"
                    [class.error]="submitted && !form.firstName" />
                  @if (submitted && !form.firstName) {
                    <span class="error-msg">กรุณากรอกชื่อ</span>
                  }
                </div>
                <div class="form-group">
                  <label for="lastName">นามสกุล <span class="required">*</span></label>
                  <input id="lastName" type="text" [(ngModel)]="form.lastName"
                    placeholder="นามสกุล" autocomplete="family-name"
                    [class.error]="submitted && !form.lastName" />
                  @if (submitted && !form.lastName) {
                    <span class="error-msg">กรุณากรอกนามสกุล</span>
                  }
                </div>
                <div class="form-group">
                  <label for="phone">เบอร์โทรศัพท์ <span class="required">*</span></label>
                  <input id="phone" type="tel" [(ngModel)]="form.phone"
                    placeholder="0XX-XXX-XXXX" autocomplete="tel"
                    [class.error]="submitted && !form.phone" />
                  @if (submitted && !form.phone) {
                    <span class="error-msg">กรุณากรอกเบอร์โทรศัพท์</span>
                  }
                </div>
                <div class="form-group">
                  <label for="email">อีเมล <span class="required">*</span></label>
                  <input id="email" type="email" [(ngModel)]="form.email"
                    placeholder="example@email.com" autocomplete="email"
                    [class.error]="submitted && !form.email" />
                  @if (submitted && !form.email) {
                    <span class="error-msg">กรุณากรอกอีเมล</span>
                  }
                </div>
              </div>
              <app-address-form
                [value]="addressValue"
                [submitted]="submitted"
                (changed)="onAddressChanged($event)"
              />
            </section>

            <section class="form-section">
              <h2 class="section-title">
                <span class="step-num">2</span>{{ 'checkout.payment' | t }}
              </h2>
              <div class="payment-options">
                @for (method of paymentMethods; track method.id) {
                  <label class="payment-option" [class.selected]="selectedPayment === method.id">
                    <input type="radio" name="payment" [value]="method.id"
                      [(ngModel)]="selectedPayment" />
                    <span class="payment-icon">{{ method.icon }}</span>
                    <div class="payment-info">
                      <span class="payment-name">{{ method.name }}</span>
                      <span class="payment-desc">{{ method.desc }}</span>
                    </div>
                    @if (selectedPayment === method.id) {
                      <span class="check-mark">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                          viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"
                          stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                    }
                  </label>
                }
              </div>
              @if (submitted && !selectedPayment) {
                <p class="error-msg mt-sm">กรุณาเลือกวิธีการชำระเงิน</p>
              }
            </section>
          </div>

          <!-- ── Right: Summary ── -->
          <aside class="order-summary">
            <h2 class="summary-title">{{ 'checkout.summary' | t }}</h2>
            <div class="summary-items">
              @for (item of cart.cartItems(); track item.product.id) {
                <div class="summary-item">
                  <img [src]="getProductImage(item.product)"
                    [alt]="item.product.name" class="item-thumb" />
                  <div class="item-details">
                    <p class="item-name">{{ item.product.name }}</p>
                    <p class="item-qty">{{ 'common.qty' | t }} {{ item.quantity }}</p>
                  </div>
                  <span class="item-price">
                    ฿{{ (item.product.price * item.quantity).toLocaleString() }}
                  </span>
                </div>
              }
            </div>

            <div class="summary-totals">
              <div class="total-row">
                <span>{{ 'checkout.subtotal' | t }}</span>
                <span>฿{{ cart.subtotal().toLocaleString() }}</span>
              </div>
              <div class="total-row">
                <span>{{ 'checkout.shipping' | t }}</span>
                <span [class.free]="cart.subtotal() >= 500">
                  {{ cart.subtotal() >= 500 ? ('checkout.free' | t) : '฿50' }}
                </span>
              </div>
              @if (selectedPayment === 'cod') {
                <div class="total-row">
                  <span>ค่าบริการเก็บเงินปลายทาง</span>
                  <span>฿30</span>
                </div>
              }
              <div class="total-row grand-total">
                <span>{{ 'checkout.total' | t }}</span>
                <span>฿{{ grandTotal().toLocaleString() }}</span>
              </div>
            </div>

            <button class="btn-place-order" (click)="placeOrder()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {{ 'checkout.confirm' | t }}
            </button>

            <p class="secure-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {{ 'checkout.secure' | t }}
            </p>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem; }

    .page-header { margin-bottom: 2rem; }
    .back-link {
      display: inline-flex; align-items: center; gap: 0.4rem;
      color: var(--clr-muted); text-decoration: none; font-size: 0.8rem;
      margin-bottom: 0.75rem; transition: color 0.2s;
    }
    .back-link:hover { color: var(--clr-text); }
    .page-header h1 {
      font-size: 1.875rem; font-weight: 800; color: var(--clr-text);
      margin: 0; letter-spacing: -0.03em;
    }

    /* ── Empty ── */
    .empty-cart { text-align: center; padding: 5rem 2rem; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-cart h2 { font-size: 1.5rem; color: var(--clr-text); margin-bottom: 0.5rem; }
    .empty-cart p { color: var(--clr-muted); margin-bottom: 1.5rem; }

    /* ── Success ── */
    .order-success { text-align: center; padding: 5rem 2rem; }
    .success-icon {
      width: 72px; height: 72px; background: var(--clr-accent);
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; margin: 0 auto 1.5rem;
    }
    .order-success h2 { font-size: 1.75rem; font-weight: 800; color: var(--clr-text); margin-bottom: 0.75rem; }
    .order-success p { color: var(--clr-muted); margin-bottom: 0.5rem; }
    .order-number { font-size: 0.95rem; margin-bottom: 2rem; }
    .order-number strong { color: var(--clr-text); }

    /* ── Checkout grid ── */
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: start;
    }

    /* ── Form sections ── */
    .form-section {
      background: white; border: 1px solid var(--clr-border);
      border-radius: 14px; padding: 1.75rem; margin-bottom: 1.25rem;
    }
    .section-title {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 1rem; font-weight: 700; color: var(--clr-text); margin: 0 0 1.5rem;
    }
    .step-num {
      width: 26px; height: 26px; background: var(--clr-accent); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 0.78rem; font-weight: 600; color: var(--clr-subtle); }
    .required { color: #ef4444; }
    .form-group input,
    .form-group select {
      padding: 0.65rem 0.875rem;
      border: 1.5px solid var(--clr-border);
      border-radius: 8px; font-size: 0.875rem;
      color: var(--clr-text); background: white;
      transition: border-color 0.2s, box-shadow 0.2s; outline: none;
    }
    .form-group input:focus,
    .form-group select:focus {
      border-color: var(--clr-accent);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
    .form-group input.error,
    .form-group select.error { border-color: #ef4444; }
    .error-msg { font-size: 0.72rem; color: #ef4444; }
    .mt-sm { margin-top: 0.5rem; }

    /* ── Payment ── */
    .payment-options { display: flex; flex-direction: column; gap: 0.625rem; }
    .payment-option {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.875rem 1.125rem;
      border: 1.5px solid var(--clr-border); border-radius: 10px;
      cursor: pointer; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .payment-option:hover { border-color: var(--clr-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
    .payment-option.selected { border-color: var(--clr-accent); background: #eff6ff; }
    .payment-option input[type="radio"] { display: none; }
    .payment-icon { font-size: 1.375rem; }
    .payment-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
    .payment-name { font-size: 0.875rem; font-weight: 600; color: var(--clr-text); }
    .payment-desc { font-size: 0.72rem; color: var(--clr-muted); }
    .check-mark {
      width: 20px; height: 20px; background: var(--clr-accent); color: white;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* ── Order summary ── */
    .order-summary {
      position: sticky; top: 80px;
      background: white; border: 1px solid var(--clr-border);
      border-radius: 14px; padding: 1.75rem;
    }
    .summary-title { font-size: 1rem; font-weight: 700; color: var(--clr-text); margin: 0 0 1.25rem; }
    .summary-items {
      display: flex; flex-direction: column; gap: 0.875rem;
      margin-bottom: 1.25rem; max-height: 280px; overflow-y: auto;
    }
    .summary-item { display: flex; align-items: center; gap: 0.75rem; }
    .item-thumb {
      width: 50px; height: 50px; border-radius: 8px;
      object-fit: cover; background: var(--clr-surface); flex-shrink: 0;
    }
    .item-details { flex: 1; min-width: 0; }
    .item-name {
      font-size: 0.78rem; font-weight: 600; color: var(--clr-text);
      margin: 0 0 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .item-qty { font-size: 0.72rem; color: var(--clr-muted); margin: 0; }
    .item-price { font-size: 0.875rem; font-weight: 700; color: var(--clr-text); flex-shrink: 0; }

    .summary-totals {
      border-top: 1px solid var(--clr-border); padding-top: 1rem;
      display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;
    }
    .total-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--clr-subtle); }
    .total-row .free { color: #16a34a; font-weight: 600; }
    .total-row.grand-total {
      font-size: 1.05rem; font-weight: 800; color: var(--clr-text);
      padding-top: 0.625rem; border-top: 1px solid var(--clr-border); margin-top: 0.25rem;
    }

    .btn-place-order {
      width: 100%; padding: 0.875rem; display: flex; align-items: center;
      justify-content: center; gap: 0.5rem;
      background: var(--clr-accent); color: white; border: none;
      border-radius: 10px; font-size: 0.95rem; font-weight: 700;
      cursor: pointer; transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      margin-bottom: 0.875rem;
    }
    .btn-place-order:hover {
      background: var(--clr-accent-dark);
      box-shadow: 0 4px 14px rgba(37,99,235,0.35);
      transform: translateY(-1px);
    }
    .btn-place-order:active { transform: translateY(0); }

    .secure-note {
      display: flex; align-items: center; justify-content: center;
      gap: 0.4rem; font-size: 0.72rem; color: var(--clr-muted); margin: 0;
    }

    /* ── Shared CTA ── */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.4rem;
      background: var(--clr-accent); color: white;
      padding: 0.75rem 1.75rem; border-radius: 8px;
      text-decoration: none; font-weight: 600; font-size: 0.9rem;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .btn-primary:hover {
      background: var(--clr-accent-dark);
      box-shadow: 0 4px 14px rgba(37,99,235,0.3);
      transform: translateY(-1px);
    }
    .btn-primary:active { transform: translateY(0); }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .order-summary { position: static; }
    }
    @media (max-width: 480px) {
      .form-grid { grid-template-columns: 1fr; }
      .page-header h1 { font-size: 1.5rem; }
    }
  `],
})
export class CheckoutComponent {
  protected readonly cart  = inject(CartService);
  private  readonly auth   = inject(AuthService);
  private  readonly email  = inject(EmailService);
  protected readonly i18n  = inject(I18nService);

  protected form: AddressForm = {
    firstName: '', lastName: '', phone: '', email: '',
    address: '', district: '', province: '', postalCode: '',
  };

  protected addressValue: Partial<AddressValue> = {};
  protected selectedPayment = '';
  protected submitted = false;
  protected readonly orderPlaced = signal(false);
  protected readonly orderNumber = signal('');

  protected onAddressChanged(v: AddressValue): void {
    this.form.address    = v.address;
    this.form.district   = v.subDistrict;   // ตำบล/แขวง
    this.form.province   = v.province;
    this.form.postalCode = v.postalCode;
  }

  protected readonly paymentMethods = [
    { id: 'promptpay', name: 'พร้อมเพย์',            icon: '📱', desc: 'สแกน QR Code ชำระเงินทันที' },
    { id: 'credit',    name: 'บัตรเครดิต/เดบิต',     icon: '💳', desc: 'Visa, Mastercard, JCB' },
    { id: 'bank',      name: 'โอนเงินผ่านธนาคาร',    icon: '🏦', desc: 'ทุกธนาคารในประเทศไทย' },
    { id: 'cod',       name: 'เก็บเงินปลายทาง',      icon: '💵', desc: 'ชำระเมื่อได้รับสินค้า (+฿30)' },
  ];

  protected readonly provinces: string[] = []; // ไม่ใช้แล้ว — ใช้ AddressFormComponent แทน

  protected getProductImage(product: Product): string {
    return primaryImage(product)?.url ?? '';
  }

  protected grandTotal(): number {
    const shipping = this.cart.subtotal() >= 500 ? 0 : 50;
    const cod = this.selectedPayment === 'cod' ? 30 : 0;
    return this.cart.subtotal() + shipping + cod;
  }

  protected isFormValid(): boolean {
    const f = this.form;
    return !!(f.firstName && f.lastName && f.phone && f.email &&
              f.address && f.district && f.province && f.postalCode &&
              this.selectedPayment);
  }

  protected placeOrder(): void {
    this.submitted = true;
    if (!this.isFormValid()) return;
    this.orderNumber.set(Math.floor(Math.random() * 900000 + 100000).toString());
    this.orderPlaced.set(true);

    // Send order confirmation email if user is logged in
    const user = this.auth.currentUser();
    if (user) {
      const f = this.form;
      const shippingAddress = {
        id: crypto.randomUUID(),
        label: 'จัดส่ง',
        address: f.address,
        district: f.district,
        province: f.province,
        postalCode: f.postalCode,
        isDefault: false,
      };
      this.auth.createOrder(
        this.cart.cartItems(),
        this.cart.subtotal(),
        this.cart.subtotal() >= 500 ? 0 : 50,
        this.selectedPayment,
        shippingAddress,
      ).then((order) => {
        this.email.sendOrderConfirmation(user.email, `${user.firstName} ${user.lastName}`.trim(), order);
      });
    }

    this.cart.clearCart();
  }
}
