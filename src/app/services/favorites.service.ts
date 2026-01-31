import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FavoriteItem {
  productId: string;      // id produit en string
  name: string;
  price: number;
  image: string;
  categorySlug: string;
  addedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private items: FavoriteItem[] = [];
  private itemsSubject = new BehaviorSubject<FavoriteItem[]>([]);

  items$ = this.itemsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      try {
        this.items = JSON.parse(stored);
        this.itemsSubject.next(this.items);
      } catch {
        this.items = [];
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('favorites', JSON.stringify(this.items));
    this.itemsSubject.next(this.items);
  }

  addItem(item: FavoriteItem): void {
    if (!this.isFavorite(item.productId)) {
      this.items.push({ ...item, addedAt: new Date().toISOString() });
      this.saveToStorage();
    }
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(i => i.productId !== productId);
    this.saveToStorage();
  }

  toggleFavorite(item: FavoriteItem): boolean {
    if (this.isFavorite(item.productId)) {
      this.removeItem(item.productId);
      return false;
    } else {
      this.addItem(item);
      return true;
    }
  }

  isFavorite(productId: string): boolean {
    return this.items.some(i => i.productId === productId);
  }

  clearFavorites(): void {
    this.items = [];
    this.saveToStorage();
  }

  getItems(): FavoriteItem[] {
    return this.items;
  }

  getTotalItems(): number {
    return this.items.length;
  }
}
