// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

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

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.loadFromStorage();
    
    // Écouter les changements d'utilisateur pour charger le bon panier
    this.authService.currentUser$.subscribe(user => {
      this.loadFromStorage();
    });
  }

  private getStorageKey(): string {
    const user = this.authService.currentUserValue;
    if (user && user.id) {
      return `cart_${user.id}`;
    }
    return 'cart_guest';
  }

  private loadFromStorage(): void {
    const key = this.getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.items = JSON.parse(stored);
        this.itemsSubject.next(this.items);
      } catch {
        this.items = [];
      }
    } else {
      this.items = [];
      this.itemsSubject.next(this.items);
    }
  }

  private saveToStorage(): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(this.items));
    this.itemsSubject.next(this.items);
  }

  // méthode appelée par certains composants (ex: details-produit)
  updateCart(): void {
    this.saveToStorage();
  }

  addItem(item: CartItem): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Veuillez vous connecter pour ajouter des articles au panier');
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
