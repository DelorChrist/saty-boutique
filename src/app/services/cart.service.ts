// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  productId: string;          // string partout
  name: string;
  price: number;
  image: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CartItem[] = [];
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);

  items$ = this.itemsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('cart');
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
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.itemsSubject.next(this.items);
  }

  // méthode appelée par certains composants (ex: details-produit)
  updateCart(): void {
    this.saveToStorage();
  }

  addItem(item: CartItem): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    const existing = this.items.find(
      i =>
        i.productId === item.productId &&
        i.size === item.size &&
        i.color === item.color
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }

    this.saveToStorage();
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
    this.saveToStorage();
  }

  clearCart(): void {
    this.items = [];
    this.saveToStorage();
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getTotalItems(): number {
    if (!this.authService.isAuthenticated()) {
      return 0;
    }
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    if (!this.authService.isAuthenticated()) {
      return 0;
    }
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
