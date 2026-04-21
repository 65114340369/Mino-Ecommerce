import { Injectable } from '@angular/core';

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderHistory {
  id: string;
  date: string;
  total: number;
  status: 'PENDING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly mockOrders: OrderHistory[] = [
    {
      id: 'ORD-100234',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      total: 1250,
      status: 'SHIPPING',
      items: [
        { productName: 'Wireless Mouse', quantity: 1, price: 1200, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&q=80' },
        { productName: 'Mousepad', quantity: 1, price: 50, image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&q=80' }
      ]
    },
    {
      id: 'ORD-098811',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      total: 3500,
      status: 'COMPLETED',
      items: [
        { productName: 'Mechanical Keyboard', quantity: 1, price: 3500, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80' }
      ]
    }
  ];

  getOrders(): OrderHistory[] {
    return this.mockOrders;
  }
}
