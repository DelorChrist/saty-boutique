// panier.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss'],
})
export class PanierComponent implements OnInit {
  items: CartItem[] = [];

  constructor(
    public cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.items = items;
    });
  }

  increaseQuantity(index: number): void {
    this.items[index].quantity++;
    this.cartService.updateCart();
  }

  decreaseQuantity(index: number): void {
    if (this.items[index].quantity > 1) {
      this.items[index].quantity--;
      this.cartService.updateCart();
    }
  }

  removeItem(index: number): void {
    if (confirm('Retirer cet article du panier ?')) {
      this.cartService.removeItem(index);
    }
  }

  clearCart(): void {
    if (confirm('Vider tout le panier ?')) {
      this.cartService.clearCart();
    }
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  proceedToCheckout(): void {
    if (this.items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/details-produit', productId]);
  }
}
