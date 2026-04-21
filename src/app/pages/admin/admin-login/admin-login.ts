import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule],
  template: `
    <div class="admin-login-page">
      <div class="login-card">

        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <h1>MINO Admin</h1>
            <p>ระบบจัดการร้านค้า</p>
          </div>
        </div>

        <!-- Error -->
        @if (error()) {
          <div class="alert-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error() }}
          </div>
        }

        <!-- Form -->
        <form (ngSubmit)="submit()" novalidate>
          <div class="form-group">
            <label for="email">อีเมลผู้ดูแลระบบ</label>
            <input id="email" type="email" [(ngModel)]="email" name="email"
              placeholder="admin@example.com" autocomplete="username"
              [class.error]="submitted && !email" />
          </div>

          <div class="form-group">
            <label for="password">รหัสผ่าน</label>
            <div class="input-wrap">
              <input id="password" [type]="showPw ? 'text' : 'password'"
                [(ngModel)]="password" name="password"
                placeholder="รหัสผ่าน" autocomplete="current-password"
                [class.error]="submitted && !password" />
              <button type="button" class="eye-btn" (click)="showPw = !showPw"
                [attr.aria-label]="showPw ? 'ซ่อน' : 'แสดง'">
                @if (showPw) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" class="btn-login" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            }
            เข้าสู่ระบบ Admin
          </button>
        </form>

        <a href="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          กลับหน้าร้าน
        </a>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      padding: 1.5rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 2.5rem 2rem;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .brand-icon {
      width: 52px;
      height: 52px;
      background: #2563eb;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand h1 {
      font-size: 1.25rem;
      font-weight: 800;
      color: white;
      margin: 0 0 0.2rem;
      letter-spacing: -0.02em;
    }
    .brand p {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0;
    }

    /* Alert */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(239,68,68,0.1);
      color: #fca5a5;
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    /* Form */
    form { display: flex; flex-direction: column; gap: 1.125rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #94a3b8;
    }
    .form-group input {
      padding: 0.7rem 0.875rem;
      background: #0f172a;
      border: 1.5px solid #334155;
      border-radius: 8px;
      font-size: 0.9rem;
      color: white;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      width: 100%;
    }
    .form-group input::placeholder { color: #475569; }
    .form-group input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
    }
    .form-group input.error { border-color: #ef4444; }

    .input-wrap { position: relative; }
    .input-wrap input { padding-right: 2.5rem; }
    .eye-btn {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #475569;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.2s;
    }
    .eye-btn:hover { color: #94a3b8; }

    .btn-login {
      width: 100%;
      padding: 0.8rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      margin-top: 0.25rem;
    }
    .btn-login:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 4px 14px rgba(37,99,235,0.4);
      transform: translateY(-1px);
    }
    .btn-login:active:not(:disabled) { transform: translateY(0); }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      margin-top: 1.5rem;
      color: #475569;
      text-decoration: none;
      font-size: 0.8rem;
      transition: color 0.2s;
    }
    .back-link:hover { color: #94a3b8; }
  `],
})
export class AdminLoginComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  protected email    = '';
  protected password = '';
  protected showPw   = false;
  protected submitted = false;
  protected readonly loading = signal(false);
  protected readonly error   = signal('');

  async submit(): Promise<void> {
    this.submitted = true;
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    this.loading.set(true);
    const result = await this.auth.login(this.email, this.password);
    this.loading.set(false);

    if (!result.success) {
      this.error.set(result.error ?? 'เกิดข้อผิดพลาด');
      return;
    }

    // ตรวจสอบว่าเป็น admin จริงไหม
    if (!this.auth.isAdmin()) {
      this.auth.logout();
      this.error.set('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งาน Admin');
      return;
    }

    this.router.navigate(['/admin']);
  }
}
