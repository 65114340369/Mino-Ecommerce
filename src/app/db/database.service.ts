import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase, deleteDB } from 'idb';
import { MinoShopDB, DB_NAME, DB_VERSION } from './schema';
import { Product } from '../models/product.model';
import { User, Order } from '../models/user.model';
import { SEED_PRODUCTS } from './seed-data';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<MinoShopDB>>;

  // Expose ready state so UI can react
  readonly isReady: Promise<boolean>;

  constructor() {
    this.dbPromise = this.openWithMigration();
    this.isReady   = this.dbPromise.then(() => true).catch(() => false);
  }

  // ── Open with auto-migration ─────────────────────────────────────────────────

  private async openWithMigration(): Promise<IDBPDatabase<MinoShopDB>> {
    const currentVersion = await this.getCurrentVersion();
    console.log(`[DB] Current version in browser: ${currentVersion}, target: ${DB_VERSION}`);

    // If DB exists but is old schema (missing users/orders), delete it
    if (currentVersion > 0 && currentVersion < 3) {
      console.warn('[DB] Old schema detected — deleting and recreating...');
      await deleteDB(DB_NAME);
      console.log('[DB] Old DB deleted.');
    }

    return this.initDB();
  }

  private getCurrentVersion(): Promise<number> {
    return new Promise((resolve) => {
      const req = indexedDB.open(DB_NAME);
      req.onsuccess = () => {
        const version = req.result.version;
        req.result.close();
        resolve(version);
      };
      req.onerror = () => resolve(0);
      // If DB doesn't exist yet, onupgradeneeded fires — just close and return 0
      req.onupgradeneeded = () => {
        req.result.close();
        // Delete the empty DB we just created
        indexedDB.deleteDatabase(DB_NAME);
        resolve(0);
      };
    });
  }

  private async initDB(): Promise<IDBPDatabase<MinoShopDB>> {
    console.log('[DB] Opening database...');

    const db = await openDB<MinoShopDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, tx) {
        console.log(`[DB] Upgrading from v${oldVersion} → v${newVersion}`);

        if (oldVersion < 1) {
          const store = db.createObjectStore('products', { keyPath: 'id' });
          store.createIndex('by-slug',      'slug',      { unique: true });
          store.createIndex('by-category',  'category',  { unique: false });
          store.createIndex('by-tags',      'tags',      { unique: false, multiEntry: true });
          store.createIndex('by-price',     'price',     { unique: false });
          store.createIndex('by-stock',     'stock',     { unique: false });
          store.createIndex('by-createdAt', 'createdAt', { unique: false });
        }
        if (oldVersion < 2) {
          const store = tx.objectStore('products');
          SEED_PRODUCTS.forEach((p) => store.put(p));
        }
        if (oldVersion < 3) {
          const users = db.createObjectStore('users', { keyPath: 'id' });
          users.createIndex('by-email', 'email', { unique: true });

          const orders = db.createObjectStore('orders', { keyPath: 'id' });
          orders.createIndex('by-userId',    'userId',    { unique: false });
          orders.createIndex('by-createdAt', 'createdAt', { unique: false });
        }
        if (oldVersion < 4) {
          // Re-seed products to add nameTh field
          const store = tx.objectStore('products');
          SEED_PRODUCTS.forEach((p) => store.put(p));
        }
        if (oldVersion < 5) {
          // Re-seed products to add descriptionTh field
          const store = tx.objectStore('products');
          SEED_PRODUCTS.forEach((p) => store.put(p));
        }
      },
      blocked() {
        // Another tab has old version open — ask user to close other tabs
        console.warn('[DB] Upgrade blocked by another tab. Please close other tabs and refresh.');
      },
      blocking() {
        // This tab is blocking another tab's upgrade — reload to release
        window.location.reload();
      },
    });

    // Always re-seed products to ensure latest data (nameTh, encoding fixes)
    const count = await db.count('products');
    const stores = Array.from(db.objectStoreNames).join(', ');
    console.log(`[DB] Ready ✓  stores=[${stores}]  products=${count}`);

    // Re-seed if empty or missing descriptionTh (force update)
    const shouldReseed = count === 0 || await this.needsReseed(db);
    if (shouldReseed) {
      console.log('[DB] Seeding/re-seeding products...');
      const tx = db.transaction('products', 'readwrite');
      await Promise.all([...SEED_PRODUCTS.map((p: Product) => tx.store.put(p)), tx.done]);
      console.log('[DB] Products seeded.');
    }

    return db;
  }

  private get db(): Promise<IDBPDatabase<MinoShopDB>> {
    return this.dbPromise;
  }

  // ── Hard reset (callable from UI) ───────────────────────────────────────────

  private async needsReseed(db: IDBPDatabase<MinoShopDB>): Promise<boolean> {
    try {
      const all = await db.getAll('products');
      if (!all.length) return true;
      // Re-seed if any product is missing descriptionTh or has garbled text
      return all.some((p: any) =>
        !p.descriptionTh ||
        !p.nameTh ||
        (p.description && p.description.includes('\u00e0\u00b8'))
      );
    } catch { return true; }
  }

  async resetDatabase(): Promise<void> {
    console.warn('[DB] Hard reset requested...');
    try {
      const db = await this.db;
      db.close();
    } catch { /* ignore */ }
    await deleteDB(DB_NAME);
    console.log('[DB] Deleted. Reloading...');
    window.location.reload();
  }

  // ── Products ─────────────────────────────────────────────────────────────────

  async getAll(): Promise<Product[]> {
    return (await this.db).getAll('products');
  }

  async getById(id: number): Promise<Product | undefined> {
    return (await this.db).get('products', id);
  }

  async getBySlug(slug: string): Promise<Product | undefined> {
    return (await this.db).getFromIndex('products', 'by-slug', slug);
  }

  async getByCategory(category: string): Promise<Product[]> {
    return (await this.db).getAllFromIndex('products', 'by-category', category);
  }

  async getByTag(tag: string): Promise<Product[]> {
    return (await this.db).getAllFromIndex('products', 'by-tags', tag);
  }

  async upsertProduct(product: Product): Promise<void> {
    const now = Date.now();
    await (await this.db).put('products', {
      ...product,
      updatedAt: now,
      createdAt: product.createdAt ?? now,
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await (await this.db).delete('products', id);
  }

  async updateStock(id: number, delta: number): Promise<void> {
    const db  = await this.db;
    const tx  = db.transaction('products', 'readwrite');
    const product = await tx.store.get(id);
    if (product) {
      product.stock     = Math.max(0, product.stock + delta);
      product.updatedAt = Date.now();
      await tx.store.put(product);
    }
    await tx.done;
  }

  async getInStock(): Promise<Product[]> {
    return (await this.getAll()).filter((p) => p.stock > 0);
  }

  async getBestsellers(): Promise<Product[]> {
    return (await this.getAll()).filter((p) => p.isBestseller);
  }

  async getRelated(product: Product, limit = 4): Promise<Product[]> {
    return (await this.getByCategory(product.category))
      .filter((p) => p.id !== product.id)
      .slice(0, limit);
  }

  async getCategories(): Promise<string[]> {
    return [...new Set((await this.getAll()).map((p) => p.category))];
  }

  async getPaginated(page: number, pageSize: number): Promise<{ items: Product[]; total: number }> {
    const all   = (await this.getAll()).sort((a, b) => b.createdAt - a.createdAt);
    const start = (page - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length };
  }

  // ── Users ─────────────────────────────────────────────────────────────────────

  async getUserByEmail(email: string): Promise<User | undefined> {
    return (await this.db).getFromIndex('users', 'by-email', email.toLowerCase());
  }

  async getUserById(id: string): Promise<User | undefined> {
    return (await this.db).get('users', id);
  }

  async upsertUser(user: User): Promise<void> {
    await (await this.db).put('users', { ...user, updatedAt: Date.now() });
  }

  // ── Orders ────────────────────────────────────────────────────────────────────

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await (await this.db).getAllFromIndex('orders', 'by-userId', userId);
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return (await this.db).get('orders', id);
  }

  async upsertOrder(order: Order): Promise<void> {
    await (await this.db).put('orders', { ...order, updatedAt: Date.now() });
  }
}
