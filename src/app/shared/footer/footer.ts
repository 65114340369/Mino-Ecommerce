import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="brand-name">MINO<span class="dot">.</span></span>
          <p>สินค้าคุณภาพ ดีไซน์มินิมอล<br>ส่งตรงถึงบ้านคุณ</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>สินค้า</h4>
            <a routerLink="/products">ทั้งหมด</a>
            <a routerLink="/products" [queryParams]="{ category: 'electronics' }">อิเล็กทรอนิกส์</a>
            <a routerLink="/products" [queryParams]="{ category: 'clothing' }">เสื้อผ้า</a>
            <a routerLink="/products" [queryParams]="{ category: 'home' }">ของใช้ในบ้าน</a>
          </div>
          <div class="link-group">
            <h4>บริการ</h4>
            <a href="#">ติดต่อเรา</a>
            <a href="#">นโยบายคืนสินค้า</a>
            <a href="#">การจัดส่ง</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 MINO. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #111;
      color: #aaa;
      margin-top: 5rem;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      display: flex;
      gap: 4rem;
      flex-wrap: wrap;
    }
    .footer-brand { flex: 1; min-width: 200px; }
    .brand-name {
      font-size: 1.5rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.05em;
    }
    .dot { color: #6366f1; }
    .footer-brand p {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      line-height: 1.6;
    }
    .footer-links {
      display: flex;
      gap: 3rem;
      flex-wrap: wrap;
    }
    .link-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .link-group h4 {
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
    }
    .link-group a {
      color: #aaa;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .link-group a:hover { color: #fff; }
    .footer-bottom {
      border-top: 1px solid #222;
      padding: 1.25rem 1.5rem;
      text-align: center;
      font-size: 0.8rem;
    }
  `],
})
export class FooterComponent {}
