import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';
import { Order } from '../models/user.model';

const { publicKey, serviceId, templates } = environment.emailjs;

@Injectable({ providedIn: 'root' })
export class EmailService {
  private initialized = false;

  private init(): void {
    if (this.initialized) return;
    emailjs.init({ publicKey });
    this.initialized = true;
  }

  // ── Welcome email หลังสมัครสมาชิก ──────────────────────────────────────────

  async sendWelcome(toEmail: string, toName: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('[Email] EmailJS not configured — skipping welcome email');
      return;
    }
    this.init();
    try {
      await emailjs.send(serviceId, templates.welcome, {
        to_email:  toEmail,
        to_name:   toName,
        from_name: 'MINO Shop',
      });
      console.log('[Email] Welcome email sent to', toEmail);
    } catch (err) {
      console.error('[Email] Failed to send welcome email:', err);
    }
  }

  // ── Order confirmation หลังชำระเงิน ────────────────────────────────────────

  async sendOrderConfirmation(toEmail: string, toName: string, order: Order): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('[Email] EmailJS not configured — skipping order confirmation');
      return;
    }
    this.init();

    const itemsText = order.items
      .map((i) => `${i.productName} x${i.quantity} = ฿${(i.price * i.quantity).toLocaleString()}`)
      .join('\n');

    try {
      await emailjs.send(serviceId, templates.order, {
        to_email:    toEmail,
        to_name:     toName,
        from_name:   'MINO Shop',
        order_id:    order.id,
        order_total: `฿${order.total.toLocaleString()}`,
        order_items: itemsText,
        shipping:    order.shipping === 0 ? 'ฟรี' : `฿${order.shipping}`,
        payment:     this.paymentLabel(order.paymentMethod),
        address:     `${order.shippingAddress.address}, ${order.shippingAddress.district}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`,
      });
      console.log('[Email] Order confirmation sent to', toEmail);
    } catch (err) {
      console.error('[Email] Failed to send order confirmation:', err);
    }
  }

  // ── Check config ────────────────────────────────────────────────────────────

  isConfigured(): boolean {
    return (
      publicKey  !== 'YOUR_PUBLIC_KEY'  &&
      serviceId  !== 'YOUR_SERVICE_ID'  &&
      templates.welcome !== 'YOUR_WELCOME_TEMPLATE_ID' &&
      templates.order   !== 'YOUR_ORDER_TEMPLATE_ID'
    );
  }

  private paymentLabel(method: string): string {
    const map: Record<string, string> = {
      promptpay: 'พร้อมเพย์',
      credit:    'บัตรเครดิต/เดบิต',
      bank:      'โอนเงินผ่านธนาคาร',
      cod:       'เก็บเงินปลายทาง',
    };
    return map[method] ?? method;
  }
}
