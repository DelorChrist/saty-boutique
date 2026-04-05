import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

type SortType = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.scss'],
})
export class ProduitsComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  displayedProducts: Product[] = [];

  activeSortType: SortType = 'default';
  selectedCategory: string = 'all';
  loading = true;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  // Catégories dynamiques
  categories: Array<{ slug: string, name: string }> = [
    { slug: 'all', name: 'Toutes catégories' }
  ];

  constructor(
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = [
          { slug: 'all', name: 'Toutes catégories' },
          ...categories.map(cat => ({ slug: cat.slug, name: cat.name }))
        ];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.loading = false;
      }
    });
  }

  private applyFilters(): void {
    // Filtre par catégorie
    if (this.selectedCategory === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(
        p => p.category?.slug === this.selectedCategory,
      );
    }

    // Calcul pagination
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

  private updateDisplayedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProducts = this.filteredProducts.slice(startIndex, endIndex);
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
        this.applyFilters();
        return;
    }

    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

  filterByCategory(slug: string): void {
    this.selectedCategory = slug;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

    this.toastService.success(`${product.name} ajouté au panier !`);
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
