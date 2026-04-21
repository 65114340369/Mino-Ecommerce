import { Injectable, inject, signal } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, from } from 'rxjs';
import { DatabaseService } from '../db/database.service';
import { Product, SearchResult } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly db = inject(DatabaseService);

  // ── Public state ────────────────────────────────────────────────────────────
  readonly query = signal('');
  readonly results = signal<SearchResult[]>([]);
  readonly isSearching = signal(false);
  readonly isOpen = signal(false);

  // ── Internal stream ─────────────────────────────────────────────────────────
  private readonly query$ = new Subject<string>();

  constructor() {
    this.query$
      .pipe(
        debounceTime(200),           // wait 200ms after last keystroke
        distinctUntilChanged(),      // skip if same value
        switchMap((q) => {
          const trimmed = q.trim();
          if (trimmed.length < 1) {
            this.results.set([]);
            this.isSearching.set(false);
            return of([]);
          }
          this.isSearching.set(true);
          return from(this.runSearch(trimmed));
        })
      )
      .subscribe((results) => {
        this.results.set(results);
        this.isSearching.set(false);
      });
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  search(query: string): void {
    this.query.set(query);
    this.isOpen.set(query.trim().length > 0);
    this.query$.next(query);
  }

  clear(): void {
    this.query.set('');
    this.results.set([]);
    this.isOpen.set(false);
    this.isSearching.set(false);
  }

  close(): void {
    this.isOpen.set(false);
  }

  // ── Search engine ────────────────────────────────────────────────────────────

  private async runSearch(query: string): Promise<SearchResult[]> {
    const products = await this.db.getAll();
    const tokens = this.tokenize(query);

    const scored = products
      .map((p) => this.scoreProduct(p, tokens, query))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);   // max 8 results in dropdown

    return scored;
  }

  private scoreProduct(
    product: Product,
    tokens: string[],
    rawQuery: string
  ): SearchResult {
    let score = 0;
    const matchedFields: SearchResult['matchedFields'] = [];
    const q = rawQuery.toLowerCase();

    // ── Exact / prefix match on name (highest weight) ──────────────────────
    const nameLower = product.name.toLowerCase();
    if (nameLower === q) {
      score += 1.0;
      matchedFields.push('name');
    } else if (nameLower.startsWith(q)) {
      score += 0.8;
      matchedFields.push('name');
    } else if (nameLower.includes(q)) {
      score += 0.6;
      matchedFields.push('name');
    } else if (tokens.some((t) => nameLower.includes(t))) {
      score += 0.4;
      matchedFields.push('name');
    }

    // ── Tag match ──────────────────────────────────────────────────────────
    const tagHit = product.tags.some(
      (tag) => tag.toLowerCase().includes(q) || tokens.some((t) => tag.toLowerCase().includes(t))
    );
    if (tagHit) {
      score += 0.35;
      matchedFields.push('tags');
    }

    // ── Category match ─────────────────────────────────────────────────────
    if (product.category.toLowerCase().includes(q)) {
      score += 0.25;
      matchedFields.push('category');
    }

    // ── Description match (lowest weight, strip markdown) ─────────────────
    const plainDesc = stripMarkdown(product.description).toLowerCase();
    if (tokens.some((t) => plainDesc.includes(t))) {
      score += 0.15;
      matchedFields.push('description');
    }

    return { product, score, matchedFields };
  }

  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2);
  }
}

// ── Markdown stripper (lightweight, no deps) ──────────────────────────────────
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')   // code blocks
    .replace(/`[^`]+`/g, '')          // inline code
    .replace(/#{1,6}\s/g, '')         // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')    // italic
    .replace(/_([^_]+)_/g, '$1')      // italic underscore
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[|>-]/g, ' ')           // tables, blockquotes, lists
    .replace(/\s+/g, ' ')
    .trim();
}
