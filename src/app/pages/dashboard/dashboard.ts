import { Component, inject, signal, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Order, ShippingAddress, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, OrderStatus } from "../../models/user.model";
import { AddressFormComponent, AddressValue } from "../../shared/address-form/address-form";

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "shipped", "delivered"];

type DashTab = "profile" | "orders" | "address";

@Component({
  selector: "app-dashboard",
  imports: [RouterLink, FormsModule, AddressFormComponent],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);

  protected readonly activeTab = signal<DashTab>("profile");
  protected readonly orders    = signal<Order[]>([]);
  protected readonly receipt   = signal<Order | null>(null);
  protected readonly loading   = signal(false);
  protected readonly saved     = signal(false);
  protected readonly pwSaved   = signal(false);
  protected readonly pwError   = signal("");

  // Profile form
  protected profileForm = { firstName: "", lastName: "", phone: "" };
  protected profileSubmitted = false;

  // Avatar
  protected readonly avatarPreview = signal<string>("");

  // Password form
  protected showPasswordForm = false;
  protected passwordForm = { current: "", newPw: "", confirm: "" };
  protected passwordSubmitted = false;
  protected showCurrentPw = false;
  protected showNewPw = false;

  // Address form
  protected showAddressForm = false;
  protected editingAddress: ShippingAddress | null = null;
  protected addressForm: ShippingAddress = this.blankAddress();
  protected addrFormValue: Partial<AddressValue> = {};

  async ngOnInit(): Promise<void> {
    const u = this.auth.currentUser();
    if (u) {
      this.profileForm = { firstName: u.firstName, lastName: u.lastName, phone: u.phone };
      this.avatarPreview.set(u.avatar ?? "");
      await this.auth.seedDemoOrders(u.id);
    }
    this.orders.set(await this.auth.getOrders());
  }

  protected setTab(tab: DashTab): void {
    this.activeTab.set(tab);
    if (tab === "orders") this.refreshOrders();
  }

  protected async refreshOrders(): Promise<void> {
    this.orders.set(await this.auth.getOrders());
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────

  protected onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("รูปภาพต้องมีขนาดไม่เกิน 2MB"); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      this.avatarPreview.set(dataUrl);
      await this.auth.updateProfile({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  protected removeAvatar(): void {
    this.avatarPreview.set("");
    this.auth.updateProfile({ avatar: "" });
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  protected async saveProfile(): Promise<void> {
    this.profileSubmitted = true;
    const f = this.profileForm;
    if (!f.firstName || !f.lastName || !f.phone) return;
    this.loading.set(true);
    await this.auth.updateProfile(f);
    this.loading.set(false);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  // ── Password ───────────────────────────────────────────────────────────────

  protected async savePassword(): Promise<void> {
    this.passwordSubmitted = true;
    this.pwError.set("");
    const f = this.passwordForm;
    if (!f.current || !f.newPw || !f.confirm) return;
    if (f.newPw.length < 8) { this.pwError.set("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (f.newPw !== f.confirm) { this.pwError.set("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    this.loading.set(true);
    const result = await this.auth.changePassword(f.current, f.newPw);
    this.loading.set(false);
    if (!result.success) { this.pwError.set(result.error ?? "เกิดข้อผิดพลาด"); return; }
    this.passwordForm = { current: "", newPw: "", confirm: "" };
    this.passwordSubmitted = false;
    this.showPasswordForm = false;
    this.pwSaved.set(true);
    setTimeout(() => this.pwSaved.set(false), 2500);
  }

  protected strengthPct(pw: string): number {
    let s = 0;
    if (pw.length >= 8)  s += 25;
    if (pw.length >= 12) s += 15;
    if (/[A-Z]/.test(pw)) s += 20;
    if (/[0-9]/.test(pw)) s += 20;
    if (/[^A-Za-z0-9]/.test(pw)) s += 20;
    return Math.min(s, 100);
  }

  protected strengthColor(pw: string): string {
    const p = this.strengthPct(pw);
    if (p < 40) return "#ef4444";
    if (p < 70) return "#f59e0b";
    return "#22c55e";
  }

  // ── Address ────────────────────────────────────────────────────────────────

  protected openAddAddress(): void {
    this.editingAddress = null;
    this.addressForm = this.blankAddress();
    this.addrFormValue = {};
    this.showAddressForm = true;
  }

  protected openEditAddress(addr: ShippingAddress): void {
    this.editingAddress = addr;
    this.addressForm = { ...addr };
    this.addrFormValue = {
      address:     addr.address,
      subDistrict: addr.district,
      province:    addr.province,
      postalCode:  addr.postalCode,
    };
    this.showAddressForm = true;
  }

  protected onAddrChanged(v: AddressValue): void {
    this.addressForm.address    = v.address;
    this.addressForm.district   = v.subDistrict;
    this.addressForm.province   = v.province;
    this.addressForm.postalCode = v.postalCode;
  }

  protected async saveAddress(): Promise<void> {
    if (!this.addressForm.label || !this.addressForm.address ||
        !this.addressForm.district || !this.addressForm.province || !this.addressForm.postalCode) return;
    if (!this.editingAddress) this.addressForm.id = crypto.randomUUID();
    await this.auth.upsertAddress(this.addressForm);
    this.showAddressForm = false;
  }

  protected async deleteAddress(id: string): Promise<void> {
    await this.auth.deleteAddress(id);
  }

  protected cancelAddress(): void { this.showAddressForm = false; }

  private blankAddress(): ShippingAddress {
    return { id: "", label: "", address: "", district: "", province: "", postalCode: "", isDefault: false };
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  protected openReceipt(order: Order): void  { this.receipt.set(order); }
  protected closeReceipt(): void             { this.receipt.set(null); }

  protected statusLabel(s: OrderStatus): string { return ORDER_STATUS_LABEL[s]; }
  protected statusColor(s: OrderStatus): string { return ORDER_STATUS_COLOR[s]; }

  protected readonly statusSteps: { key: OrderStatus; label: string }[] = [
    { key: "preparing", label: "เตรียมการ" },
    { key: "shipped",   label: "ขนส่ง" },
    { key: "delivered", label: "สำเร็จ" },
  ];

  protected isStepDone(order: Order, step: OrderStatus): boolean {
    return STATUS_ORDER.indexOf(order.status) >= STATUS_ORDER.indexOf(step);
  }

  protected paymentLabel(m: string): string {
    const map: Record<string, string> = {
      promptpay: "พร้อมเพย์", credit: "บัตรเครดิต/เดบิต",
      bank: "โอนเงิน", cod: "เก็บเงินปลายทาง",
    };
    return map[m] ?? m;
  }

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  protected readonly provinces = [
    "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร",
    "ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท",
    "ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง",
    "ตราด","ตาก","นครนายก","นครปฐม","นครพนม",
    "นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส",
    "น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์",
    "ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พะเยา","พังงา",
    "พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์",
    "แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน",
    "ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง",
    "ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย",
    "ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ",
    "สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี",
    "สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย",
    "หนองบัวลำภู","อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์",
    "อุทัยธานี","อุบลราชธานี",
  ];
}
