import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ProductService, Product } from '../../services/product.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-nouveaux-produits',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nouveaux-produits.component.html',
  styleUrl: './nouveaux-produits.component.scss'
})
export class NouveauxProduitsComponent implements OnInit {
  newProducts: Product[] = [];
  loading = true;

  constructor(
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService,
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    this.loadNewProducts();
  }

  private loadNewProducts(): void {
    this.loading = true;
    this.productService.getNewProducts().subscribe({
      next: (products) => {
        this.newProducts = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des nouveaux produits:', err);
        this.loading = false;
      }
    });
  }

  goToProduct(id: string): void {
    this.router.navigate(['/details-produit', id]);
  }

  addToCart(product: Product): void {
    this.cartService.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/assets/placeholder.jpg',
      size: null,
      color: null,
      quantity: 1,
    });

    alert(`${product.name} ajouté au panier !`);
  }

  toggleFavorite(product: Product): void {
    const isFav = this.favoritesService.toggleFavorite({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/assets/placeholder.jpg',
      categorySlug: product.category?.slug || '',
      addedAt: new Date().toISOString(),
    });

    if (isFav) {
      alert(`${product.name} ajouté aux favoris ❤️`);
    } else {
      alert(`${product.name} retiré des favoris`);
    }
  }

  getImageUrl(images: string[]): string {
    if (!images || images.length === 0) {
      return '/assets/placeholder.jpg';
    }
    if (images[0].startsWith('http')) {
      return images[0];
    }
    return `${environment.mediaUrl}${images[0]}`;
  }
}
