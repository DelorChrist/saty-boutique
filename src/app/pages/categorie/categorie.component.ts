import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { environment } from '../../../environments/environment';

type SortType = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

@Component({
  selector: 'app-categorie',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss'],
})
export class CategorieComponent implements OnInit {
  categorySlug: string = '';
  category: Category | null = null;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  activeSortType: SortType = 'default';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService,
    private productService: ProductService,
    private categoryService: CategoryService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') ?? '';
      this.loadCategory();
    });
  }

  private loadCategory(): void {
    this.loading = true;

    // Charger les infos de la catégorie
    this.categoryService.getCategoryBySlug(this.categorySlug).subscribe({
      next: (category) => {
        this.category = category;
        this.loadProducts(category.id);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la catégorie:', err);
        this.loading = false;
      }
    });
  }

  private loadProducts(categoryId: string): void {
    this.productService.getProductsByCategory(categoryId).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.loading = false;
      }
    });
  }

  sortBy(type: SortType): void {
    this.activeSortType = type;

    switch (type) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'default':
        this.filteredProducts = [...this.products];
        break;
    }
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
