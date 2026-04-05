// panier.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { environment } from '../../../environments/environment';

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
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
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

  async removeItem(index: number): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Retirer cet article du panier ?',
      'Retirer l\'article',
      { confirmText: 'Retirer', type: 'warning' }
    );

    if (confirmed) {
      this.cartService.removeItem(index);
      this.toastService.success('Article retiré du panier');
    }
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Vider tout le panier ?',
      'Vider le panier',
      { confirmText: 'Vider', type: 'warning' }
    );

    if (confirmed) {
      this.cartService.clearCart();
      this.toastService.success('Panier vidé');
    }
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  proceedToCheckout(): void {
    if (this.items.length === 0) {
      this.toastService.warning('Votre panier est vide');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/details-produit', productId]);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.mediaUrl}${imagePath}`;
  }
}
