import { Injectable } from '@angular/core';

export interface District {
  name: string;
  subDistricts: string[];
}

export interface AddressOption {
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
}

@Injectable({ providedIn: 'root' })
export class ThailandAddressService {
  private data: any[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    const raw = await import('thai-data/data.json');
    this.data = (raw as any).default ?? raw;
    this.loaded = true;
  }

  /** Get all unique province names */
  getProvinces(): string[] {
    const set = new Set<string>();
    for (const entry of this.data) {
      for (const p of entry.provinceList ?? []) {
        if (p.provinceName) set.add(p.provinceName);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'th'));
  }

  /** Get districts for a given province */
  getDistricts(province: string): string[] {
    const set = new Set<string>();
    for (const entry of this.data) {
      const hasProvince = (entry.provinceList ?? []).some(
        (p: any) => p.provinceName === province
      );
      if (!hasProvince) continue;
      for (const d of entry.districtList ?? []) {
        if (d.districtName) set.add(d.districtName);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'th'));
  }

  /** Get sub-districts for a given province + district */
  getSubDistricts(province: string, district: string): string[] {
    const set = new Set<string>();
    for (const entry of this.data) {
      const hasProvince = (entry.provinceList ?? []).some(
        (p: any) => p.provinceName === province
      );
      const hasDistrict = (entry.districtList ?? []).some(
        (d: any) => d.districtName === district
      );
      if (!hasProvince || !hasDistrict) continue;
      for (const s of entry.subDistrictList ?? []) {
        if (s.subDistrictName) set.add(s.subDistrictName);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'th'));
  }

  /** Get postal code for province + district + subDistrict */
  getPostalCode(province: string, district: string, subDistrict: string): string {
    for (const entry of this.data) {
      const hasProvince = (entry.provinceList ?? []).some(
        (p: any) => p.provinceName === province
      );
      const hasDistrict = (entry.districtList ?? []).some(
        (d: any) => d.districtName === district
      );
      const hasSub = (entry.subDistrictList ?? []).some(
        (s: any) => s.subDistrictName === subDistrict
      );
      if (hasProvince && hasDistrict && hasSub) return entry.zipCode ?? '';
    }
    return '';
  }
}
