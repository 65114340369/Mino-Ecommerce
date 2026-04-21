import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { DatabaseService } from '../../db/database.service';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { environment } from '../../../environments/environment';

declare const google: any;

type AuthMode = 'login' | 'register';

interface LoginForm  { email: string; password: string; }
interface RegisterForm { email: string; password: string; confirmPassword: string; firstName: string; lastName: string; phone: string; }

@Component({
  selector: 'app-auth',
  imports: [RouterLink, FormsModule, TranslatePipe],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <!-- Brand -->
        <a routerLink="/" class="auth-brand">MINO<span>.</span></a>

        <!-- Tab switcher -->
        <div class="auth-tabs" role="tablist">
          <button role="tab" class="tab-btn" [class.active]="mode() === 'login'"
            (click)="setMode('login')" [attr.aria-selected]="mode() === 'login'">
            {{ 'auth.login' | t }}
          </button>
          <button role="tab" class="tab-btn" [class.active]="mode() === 'register'"
            (click)="setMode('register')" [attr.aria-selected]="mode() === 'register'">
            {{ 'auth.register' | t }}
          </button>
        </div>

        <!-- Google Sign-In -->
        @if (isGoogleConfigured) {
          <div class="google-section" [style.display]="mode() === 'login' ? 'block' : 'none'">
            <div id="google-btn"></div>
            <div class="divider"><span>หรือ</span></div>
          </div>
        }

        <!-- Global error -->
        @if (serverError()) {
          <div class="alert-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ serverError() }}
          </div>
        }

        <!-- ── LOGIN ── -->
        @if (mode() === 'login') {
          <form class="auth-form" (ngSubmit)="submitLogin()" novalidate>
            <div class="form-group">
              <label for="l-email">อีเมล</label>
              <input id="l-email" type="email" [(ngModel)]="loginForm.email" name="email"
                placeholder="example@email.com" autocomplete="email"
                [class.error]="submitted && emailError(loginForm.email)" />
              @if (submitted && emailError(loginForm.email)) {
                <span class="field-error">{{ emailError(loginForm.email) }}</span>
              }
            </div>

            <div class="form-group">
              <label for="l-pass">รหัสผ่าน</label>
              <div class="input-wrap">
                <input id="l-pass" [type]="showPass() ? 'text' : 'password'"
                  [(ngModel)]="loginForm.password" name="password"
                  placeholder="รหัสผ่าน" autocomplete="current-password"
                  [class.error]="submitted && !loginForm.password" />
                <button type="button" class="eye-btn" (click)="showPass.update(v => !v)"
                  [attr.aria-label]="showPass() ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'">
                  @if (showPass()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (submitted && !loginForm.password) {
                <span class="field-error">กรุณากรอกรหัสผ่าน</span>
              }
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading()">
              @if (loading()) { <span class="spinner"></span> }
              เข้าสู่ระบบ
            </button>

            <p class="auth-hint">
              ยังไม่มีบัญชี?
              <button type="button" class="link-btn" (click)="setMode('register')">สมัครสมาชิก</button>
            </p>
          </form>
        }

        <!-- ── REGISTER ── -->
        @if (mode() === 'register') {
          <form class="auth-form" (ngSubmit)="submitRegister()" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="r-fname">ชื่อ</label>
                <input id="r-fname" type="text" [(ngModel)]="registerForm.firstName" name="firstName"
                  placeholder="ชื่อจริง" autocomplete="given-name"
                  [class.error]="submitted && !registerForm.firstName" />
                @if (submitted && !registerForm.firstName) {
                  <span class="field-error">กรุณากรอกชื่อ</span>
                }
              </div>
              <div class="form-group">
                <label for="r-lname">นามสกุล</label>
                <input id="r-lname" type="text" [(ngModel)]="registerForm.lastName" name="lastName"
                  placeholder="นามสกุล" autocomplete="family-name"
                  [class.error]="submitted && !registerForm.lastName" />
                @if (submitted && !registerForm.lastName) {
                  <span class="field-error">กรุณากรอกนามสกุล</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="r-email">อีเมล</label>
              <input id="r-email" type="email" [(ngModel)]="registerForm.email" name="email"
                placeholder="example@email.com" autocomplete="email"
                [class.error]="submitted && emailError(registerForm.email)" />
              @if (submitted && emailError(registerForm.email)) {
                <span class="field-error">{{ emailError(registerForm.email) }}</span>
              }
            </div>

            <div class="form-group">
              <label for="r-phone">เบอร์โทรศัพท์</label>
              <input id="r-phone" type="tel" [(ngModel)]="registerForm.phone" name="phone"
                placeholder="0XX-XXX-XXXX" autocomplete="tel"
                [class.error]="submitted && phoneError(registerForm.phone)" />
              @if (submitted && phoneError(registerForm.phone)) {
                <span class="field-error">{{ phoneError(registerForm.phone) }}</span>
              }
            </div>

            <div class="form-group">
              <label for="r-pass">รหัสผ่าน</label>
              <div class="input-wrap">
                <input id="r-pass" [type]="showPass() ? 'text' : 'password'"
                  [(ngModel)]="registerForm.password" name="password"
                  placeholder="อย่างน้อย 8 ตัวอักษร" autocomplete="new-password"
                  [class.error]="submitted && passwordError(registerForm.password)" />
                <button type="button" class="eye-btn" (click)="showPass.update(v => !v)"
                  [attr.aria-label]="showPass() ? 'ซ่อน' : 'แสดง'">
                  @if (showPass()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (submitted && passwordError(registerForm.password)) {
                <span class="field-error">{{ passwordError(registerForm.password) }}</span>
              }
              <!-- Strength bar -->
              @if (registerForm.password) {
                <div class="strength-bar">
                  <div class="strength-fill" [style.width]="strengthPct() + '%'"
                    [style.background]="strengthColor()"></div>
                </div>
                <span class="strength-label" [style.color]="strengthColor()">{{ strengthLabel() }}</span>
              }
            </div>

            <div class="form-group">
              <label for="r-confirm">ยืนยันรหัสผ่าน</label>
              <input id="r-confirm" [type]="showPass() ? 'text' : 'password'"
                [(ngModel)]="registerForm.confirmPassword" name="confirmPassword"
                placeholder="กรอกรหัสผ่านอีกครั้ง" autocomplete="new-password"
                [class.error]="submitted && confirmError()" />
              @if (submitted && confirmError()) {
                <span class="field-error">รหัสผ่านไม่ตรงกัน</span>
              }
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading()">
              @if (loading()) { <span class="spinner"></span> }
              สมัครสมาชิก
            </button>

            <p class="auth-hint">
              มีบัญชีแล้ว?
              <button type="button" class="link-btn" (click)="setMode('login')">เข้าสู่ระบบ</button>
            </p>
          </form>
        }

        <!-- Debug: Reset DB button -->
        <button type="button" class="reset-db-btn" (click)="resetDB()" title="ล้างฐานข้อมูลและเริ่มใหม่">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
          รีเซ็ตฐานข้อมูล
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: var(--clr-surface);
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: white;
      border: 1px solid var(--clr-border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      box-shadow: var(--shadow-md);
    }
    .auth-brand {
      display: block;
      text-align: center;
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      color: var(--clr-text);
      text-decoration: none;
      margin-bottom: 1.75rem;
    }
    .auth-brand span { color: var(--clr-accent); }

    /* Tabs */
    .auth-tabs {
      display: flex;
      background: var(--clr-surface);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 1.75rem;
      gap: 4px;
    }
    .tab-btn {
      flex: 1;
      padding: 0.55rem;
      border: none;
      border-radius: 7px;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--clr-muted);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .tab-btn.active {
      background: white;
      color: var(--clr-text);
      box-shadow: var(--shadow-sm);
    }

    /* Google section */
    .google-section { margin-bottom: 1.5rem; }
    #google-btn { display: flex; justify-content: center; margin-bottom: 1rem; }
    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.25rem 0;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--clr-border);
    }
    .divider span {
      padding: 0 0.75rem;
      font-size: 0.75rem;
      color: var(--clr-muted);
      font-weight: 500;
    }

    /* Alert */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    /* Form */
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--clr-subtle); }
    .form-group input {
      padding: 0.65rem 0.875rem;
      border: 1.5px solid var(--clr-border);
      border-radius: 8px;
      font-size: 0.9rem;
      color: var(--clr-text);
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      width: 100%;
    }
    .form-group input:focus {
      border-color: var(--clr-accent);
      box-shadow: 0 0 0 3px var(--clr-accent-ring);
    }
    .form-group input.error { border-color: #ef4444; }
    .field-error { font-size: 0.72rem; color: #ef4444; }

    /* Password input with eye toggle */
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
      color: var(--clr-muted);
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.2s;
    }
    .eye-btn:hover { color: var(--clr-text); }

    /* Password strength */
    .strength-bar {
      height: 4px;
      background: var(--clr-border);
      border-radius: 2px;
      margin-top: 0.4rem;
      overflow: hidden;
    }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
    .strength-label { font-size: 0.7rem; font-weight: 600; }

    /* Submit */
    .btn-submit {
      width: 100%;
      padding: 0.8rem;
      background: var(--clr-accent);
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
    .btn-submit:hover:not(:disabled) {
      background: var(--clr-accent-dark);
      box-shadow: var(--shadow-accent);
      transform: translateY(-1px);
    }
    .btn-submit:active:not(:disabled) { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Spinner */
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-hint { text-align: center; font-size: 0.8rem; color: var(--clr-muted); margin-top: 0.25rem; }
    .link-btn {
      background: none; border: none; color: var(--clr-accent);
      font-weight: 600; cursor: pointer; font-size: inherit;
      text-decoration: underline; padding: 0;
    }

    .reset-db-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin: 1.25rem auto 0;
      background: none;
      border: none;
      color: var(--clr-muted);
      font-size: 0.72rem;
      cursor: pointer;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      transition: color 0.2s, background 0.2s;
    }
    .reset-db-btn:hover { color: #ef4444; background: #fef2f2; }

    @media (max-width: 480px) {
      .auth-card { padding: 2rem 1.25rem; }
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class AuthComponent implements OnInit {
  private readonly authService  = inject(AuthService);
  private readonly emailService = inject(EmailService);
  private readonly dbService    = inject(DatabaseService);
  private readonly router       = inject(Router);
  private readonly route        = inject(ActivatedRoute);
  private readonly platformId   = inject(PLATFORM_ID);
  protected readonly i18n       = inject(I18nService);

  protected readonly mode        = signal<AuthMode>('login');
  protected readonly loading     = signal(false);
  protected readonly serverError = signal('');
  protected readonly showPass    = signal(false);
  protected submitted = false;

  protected loginForm: LoginForm = { email: '', password: '' };
  protected registerForm: RegisterForm = {
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '',
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (environment.googleClientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') return;

    // Wait for Google script to load then render button
    const tryInit = () => {
      const btn = document.getElementById('google-btn');
      if (typeof google === 'undefined' || !btn) { setTimeout(tryInit, 300); return; }
      
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (res: { credential: string }) => this.handleGoogleCallback(res.credential),
      });
      google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: 360, text: 'continue_with', locale: 'th' });
    };
    tryInit();
  }

  private async handleGoogleCallback(credential: string): Promise<void> {
    this.loading.set(true);
    this.serverError.set('');
    const result = await this.authService.loginWithGoogle(credential);
    this.loading.set(false);

    if (!result.success) { this.serverError.set(result.error ?? 'เกิดข้อผิดพลาด'); return; }

    const user = this.authService.currentUser();
    if (user) await this.authService.seedDemoOrders(user.id);

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }

  protected get isGoogleConfigured(): boolean {
    return environment.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  }

  protected setMode(m: AuthMode): void {
    this.mode.set(m);
    this.submitted = false;
    this.serverError.set('');
  }

  // ── Validation helpers ────────────────────────────────────────────────────

  protected emailError(email: string): string {
    if (!email) return 'กรุณากรอกอีเมล';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'รูปแบบอีเมลไม่ถูกต้อง';
    return '';
  }

  protected passwordError(pw: string): string {
    if (!pw) return 'กรุณากรอกรหัสผ่าน';
    if (pw.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    return '';
  }

  protected phoneError(phone: string): string {
    if (!phone) return 'กรุณากรอกเบอร์โทรศัพท์';
    if (!/^[0-9]{9,10}$/.test(phone.replace(/[-\s]/g, ''))) return 'เบอร์โทรศัพท์ไม่ถูกต้อง';
    return '';
  }

  protected confirmError(): boolean {
    return this.registerForm.password !== this.registerForm.confirmPassword;
  }

  // ── Password strength ─────────────────────────────────────────────────────

  protected strengthPct(): number {
    const pw = this.registerForm.password;
    let score = 0;
    if (pw.length >= 8)  score += 25;
    if (pw.length >= 12) score += 15;
    if (/[A-Z]/.test(pw)) score += 20;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[^A-Za-z0-9]/.test(pw)) score += 20;
    return Math.min(score, 100);
  }

  protected strengthColor(): string {
    const p = this.strengthPct();
    if (p < 40) return '#ef4444';
    if (p < 70) return '#f59e0b';
    return '#22c55e';
  }

  protected strengthLabel(): string {
    const p = this.strengthPct();
    if (p < 40) return 'อ่อน';
    if (p < 70) return 'ปานกลาง';
    return 'แข็งแกร่ง';
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async submitLogin(): Promise<void> {
    this.submitted = true;
    this.serverError.set('');
    if (this.emailError(this.loginForm.email) || !this.loginForm.password) return;

    this.loading.set(true);
    const result = await this.authService.login(this.loginForm.email, this.loginForm.password);
    this.loading.set(false);

    if (!result.success) { this.serverError.set(result.error ?? 'เกิดข้อผิดพลาด'); return; }

    const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/dashboard';
    this.router.navigateByUrl(returnUrl);
  }

  async submitRegister(): Promise<void> {
    this.submitted = true;
    this.serverError.set('');
    const f = this.registerForm;
    if (
      this.emailError(f.email) || this.passwordError(f.password) ||
      this.phoneError(f.phone) || !f.firstName || !f.lastName || this.confirmError()
    ) return;

    this.loading.set(true);
    const result = await this.authService.register(
      f.email, f.password, f.firstName, f.lastName, f.phone,
    );
    this.loading.set(false);

    if (!result.success) { this.serverError.set(result.error ?? 'เกิดข้อผิดพลาด'); return; }

    // Seed demo orders & send welcome email
    const user = this.authService.currentUser();
    if (user) {
      await this.authService.seedDemoOrders(user.id);
      // Send welcome email (non-blocking)
      this.emailService.sendWelcome(user.email, `${user.firstName} ${user.lastName}`.trim());
    }

    this.router.navigate(['/dashboard']);
  }

  // ── Reset DB (for troubleshooting) ──────────────────────────────────────────

  resetDB(): void {
    if (confirm('ต้องการล้างฐานข้อมูลและเริ่มใหม่? (ข้อมูลทั้งหมดจะหายไป)')) {
      this.dbService.resetDatabase();
    }
  }
}
