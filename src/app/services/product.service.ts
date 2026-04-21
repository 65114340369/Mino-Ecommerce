/**
 * ProductService — thin facade over DatabaseService.
 * Components should inject this (not DatabaseService directly) so the
 * data source can be swapped without touching UI code.
 */
import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '../db/database.service';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly db = inject(DatabaseService);

  getAll(): Promise<Product[]> {
    return this.db.getAll();
  }

  getById(id: number): Promise<Product | undefined> {
    return this.db.getById(id);
  }

  getBySlug(slug: string): Promise<Product | undefined> {
    return this.db.getBySlug(slug);
  }

  getBestsellers(): Promise<Product[]> {
    return this.db.getBestsellers();
  }

  getRelated(product: Product, limit = 4): Promise<Product[]> {
    return this.db.getRelated(product, limit);
  }

  getCategories(): Promise<string[]> {
    return this.db.getCategories();
  }

  getByCategory(category: string): Promise<Product[]> {
    return this.db.getByCategory(category);
  }

  upsert(product: Product): Promise<void> {
    return this.db.upsertProduct(product);
  }

  delete(id: number): Promise<void> {
    return this.db.deleteProduct(id);
  }

  updateStock(id: number, delta: number): Promise<void> {
    return this.db.updateStock(id, delta);
  }
}
