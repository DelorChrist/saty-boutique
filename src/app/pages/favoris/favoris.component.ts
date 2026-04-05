import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FavoritesService, FavoriteItem } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-favoris',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favoris.component.html',
  styleUrls: ['./favoris.component.scss'],
})
export class FavorisComponent implements OnInit {
  favorites: FavoriteItem[] = [];

  constructor(
    public favoritesService: FavoritesService,
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.favoritesService.items$.subscribe(items => {
      this.favorites = items;
    });
  }

  removeFavorite(productId: string): void {   // ✅ string
    this.favoritesService.removeItem(productId);
  }

  addToCart(favorite: FavoriteItem): void {
    this.cartService.addItem({
      productId: favorite.productId,   // ✅ string
      name: favorite.name,
      price: favorite.price,
      image: favorite.image,
      size: null,
      color: null,
      quantity: 1,
    });

    this.toastService.success(`${favorite.name} ajouté au panier !`);
  }

  async clearAll(): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Voulez-vous vraiment vider tous vos favoris ?',
      'Vider les favoris',
      { confirmText: 'Vider', type: 'warning' }
    );

    if (confirmed) {
      this.favoritesService.clearFavorites();
      this.toastService.success('Favoris vidés');
    }
  }

  goToProduct(id: string): void {   // ✅ string
    this.router.navigate(['/details-produit', id]);
  }
}
