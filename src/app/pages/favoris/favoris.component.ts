import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FavoritesService, FavoriteItem } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';

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

    alert(`${favorite.name} ajouté au panier !`);
  }

  clearAll(): void {
    if (confirm('Voulez-vous vraiment vider tous vos favoris ?')) {
      this.favoritesService.clearFavorites();
    }
  }

  goToProduct(id: string): void {   // ✅ string
    this.router.navigate(['/details-produit', id]);
  }
}
