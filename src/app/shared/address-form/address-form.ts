import { Component, inject, input, output, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThailandAddressService } from '../../services/thailand-address.service';

export interface AddressValue {
  address: string;
  district: string;
  subDistrict: string;
  province: string;
  postalCode: string;
}

@Component({
  selector: 'app-address-form',
  imports: [FormsModule],
  template: `
    <div class="addr-fields">
      <!-- ที่อยู่ -->
      <div class="form-group full-width">
        <label>ที่อยู่ <span class="req">*</span></label>
        <input type="text" [(ngModel)]="val.address" name="address"
          placeholder="บ้านเลขที่ ถนน ซอย"
          [class.error]="submitted() && !val.address"
          (ngModelChange)="emit()" />
        @if (submitted() && !val.address) {
          <span class="field-error">กรุณากรอกที่อยู่</span>
        }
      </div>

      <!-- จังหวัด -->
      <div class="form-group">
        <label>จังหวัด <span class="req">*</span></label>
        <select [(ngModel)]="val.province" name="province"
          [class.error]="submitted() && !val.province"
          (ngModelChange)="onProvinceChange()">
          <option value="">เลือกจังหวัด</option>
          @for (p of provinces; track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>
        @if (submitted() && !val.province) {
          <span class="field-error">กรุณาเลือกจังหวัด</span>
        }
      </div>

      <!-- อำเภอ/เขต -->
      <div class="form-group">
        <label>อำเภอ/เขต <span class="req">*</span></label>
        <select [(ngModel)]="val.district" name="district"
          [class.error]="submitted() && !val.district"
          [disabled]="!val.province"
          (ngModelChange)="onDistrictChange()">
          <option value="">{{ val.province ? 'เลือกอำเภอ/เขต' : 'เลือกจังหวัดก่อน' }}</option>
          @for (d of districts; track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select>
        @if (submitted() && !val.district) {
          <span class="field-error">กรุณาเลือกอำเภอ/เขต</span>
        }
      </div>

      <!-- ตำบล/แขวง -->
      <div class="form-group">
        <label>ตำบล/แขวง <span class="req">*</span></label>
        <select [(ngModel)]="val.subDistrict" name="subDistrict"
          [class.error]="submitted() && !val.subDistrict"
          [disabled]="!val.district"
          (ngModelChange)="onSubDistrictChange()">
          <option value="">{{ val.district ? 'เลือกตำบล/แขวง' : 'เลือกอำเภอก่อน' }}</option>
          @for (s of subDistricts; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        @if (submitted() && !val.subDistrict) {
          <span class="field-error">กรุณาเลือกตำบล/แขวง</span>
        }
      </div>

      <!-- รหัสไปรษณีย์ -->
      <div class="form-group">
        <label>รหัสไปรษณีย์ <span class="req">*</span></label>
        <input type="text" [(ngModel)]="val.postalCode" name="postalCode"
          placeholder="XXXXX" maxlength="5"
          [class.error]="submitted() && !val.postalCode"
          (ngModelChange)="emit()" />
        @if (submitted() && !val.postalCode) {
          <span class="field-error">กรุณากรอกรหัสไปรษณีย์</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .addr-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 0.78rem; font-weight: 600; color: var(--clr-subtle); }
    .req { color: #ef4444; }
    .form-group input,
    .form-group select {
      padding: 0.65rem 0.875rem;
      border: 1.5px solid var(--clr-border);
      border-radius: 8px;
      font-size: 0.875rem;
      color: var(--clr-text);
      background: white;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      width: 100%;
    }
    .form-group input:focus,
    .form-group select:focus {
      border-color: var(--clr-accent);
      box-shadow: 0 0 0 3px var(--clr-accent-ring);
    }
    .form-group input.error,
    .form-group select.error { border-color: #ef4444; }
    .form-group select:disabled { background: var(--clr-surface); color: var(--clr-muted); cursor: not-allowed; }
    .field-error { font-size: 0.72rem; color: #ef4444; }

    @media (max-width: 480px) {
      .addr-fields { grid-template-columns: 1fr; }
    }
  `],
})
export class AddressFormComponent implements OnInit {
  private readonly svc = inject(ThailandAddressService);

  readonly value     = input<Partial<AddressValue>>({});
  readonly submitted = input(false);
  readonly changed   = output<AddressValue>();

  protected provinces:    string[] = [];
  protected districts:    string[] = [];
  protected subDistricts: string[] = [];

  protected val: AddressValue = {
    address: '', district: '', subDistrict: '', province: '', postalCode: '',
  };

  constructor() {
    effect(() => {
      const v = this.value();
      if (v) {
        this.val = {
          address:     v.address     ?? '',
          district:    v.district    ?? '',
          subDistrict: v.subDistrict ?? '',
          province:    v.province    ?? '',
          postalCode:  v.postalCode  ?? '',
        };
        if (this.val.province) {
          this.districts    = this.svc.getDistricts(this.val.province);
        }
        if (this.val.province && this.val.district) {
          this.subDistricts = this.svc.getSubDistricts(this.val.province, this.val.district);
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.svc.load();
    this.provinces = this.svc.getProvinces();
    if (this.val.province) {
      this.districts = this.svc.getDistricts(this.val.province);
    }
    if (this.val.province && this.val.district) {
      this.subDistricts = this.svc.getSubDistricts(this.val.province, this.val.district);
    }
  }

  protected onProvinceChange(): void {
    this.val.district    = '';
    this.val.subDistrict = '';
    this.val.postalCode  = '';
    this.districts    = this.svc.getDistricts(this.val.province);
    this.subDistricts = [];
    this.emit();
  }

  protected onDistrictChange(): void {
    this.val.subDistrict = '';
    this.val.postalCode  = '';
    this.subDistricts = this.svc.getSubDistricts(this.val.province, this.val.district);
    this.emit();
  }

  protected onSubDistrictChange(): void {
    this.val.postalCode = this.svc.getPostalCode(
      this.val.province, this.val.district, this.val.subDistrict
    );
    this.emit();
  }

  protected emit(): void {
    this.changed.emit({ ...this.val });
  }
}
