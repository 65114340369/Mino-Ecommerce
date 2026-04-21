import { DBSchema } from 'idb';
import { Product } from '../models/product.model';
import { User, Order } from '../models/user.model';

export interface MinoShopDB extends DBSchema {
  products: {
    key: number;
    value: Product;
    indexes: {
      'by-slug': string;
      'by-category': string;
      'by-tags': string;
      'by-price': number;
      'by-stock': number;
      'by-createdAt': number;
    };
  };
  users: {
    key: string;          // id
    value: User;
    indexes: {
      'by-email': string;
    };
  };
  orders: {
    key: string;          // id
    value: Order;
    indexes: {
      'by-userId': string;
      'by-createdAt': number;
    };
  };
}

export const DB_NAME = 'mino-shop';
export const DB_VERSION = 5;
