export interface User {
  id: string;
  email: string;
  passwordHash: string;   // SHA-256 hex (client-side only — no real backend)
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;        // base64 data URL
  addresses: ShippingAddress[];
  createdAt: number;
  updatedAt: number;
}

export interface ShippingAddress {
  id: string;
  label: string;          // e.g. "บ้าน", "ที่ทำงาน"
  address: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;             // e.g. "ORD-123456"
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  statusHistory: StatusEvent[];
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'pending'       // รอดำเนินการ
  | 'preparing'     // กำลังเตรียมการ
  | 'shipped'       // อยู่ระหว่างขนส่ง
  | 'delivered'     // จัดส่งสำเร็จ
  | 'cancelled';    // ยกเลิก

export interface StatusEvent {
  status: OrderStatus;
  timestamp: number;
  note?: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'รอดำเนินการ',
  preparing: 'กำลังเตรียมการ',
  shipped:   'อยู่ระหว่างขนส่ง',
  delivered: 'จัดส่งสำเร็จ',
  cancelled: 'ยกเลิก',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending:   '#f59e0b',
  preparing: '#3b82f6',
  shipped:   '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};
