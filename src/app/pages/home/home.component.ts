import {
  Component,
  AfterViewInit,
  AfterViewChecked,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, AfterViewChecked {
  activeCategory: 'boubous' | 'robes' | 'ensembles' | 'accessoires' = 'boubous';

  // Données depuis l'API
  featuredProducts: Product[] = [];
  newProducts: Product[] = [];
  categories: Category[] = [];
  bestSellerProduct: Product | null = null;
  featuredProduct: Product | null = null;
  allProducts: Product[] = [];
  bestSellersProducts: Product[] = [];
  loading = true;

  private observer: IntersectionObserver | null = null;
  private animationsInitialized = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Charger les produits en vedette
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits en vedette:', err);
        this.loading = false;
      }
    });

    // Charger les nouveaux produits
    this.productService.getNewProducts().subscribe({
      next: (products) => {
        this.newProducts = products;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des nouveaux produits:', err);
      }
    });

    // Charger les catégories
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });

    // Charger les meilleures ventes (optionnel maintenant)
    this.productService.getBestSellers().subscribe({
      next: (products) => {
        if (products.length > 0) {
          this.bestSellerProduct = products[0];
        }
      }
    });

    // On synchronise les appels pour un filtrage propre
    forkJoin({
      featured: this.productService.getFeaturedProducts(),
      all: this.productService.getProducts()
    }).subscribe({
      next: (result: { featured: Product[], all: Product[] }) => {
        if (result.featured.length > 0) {
          this.featuredProduct = result.featured[0];
        }
        // Exclure le produit vedette de la liste générale
        this.allProducts = result.all.filter((p: Product) => p.id !== this.featuredProduct?.id);

        // Stocker toutes les meilleures ventes pour les onglets
        this.bestSellersProducts = result.all.filter((p: Product) => !!p.isBestSeller);

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des produits synchronisés:', err);
        this.loading = false;
      }
    });
  }

  /* ---------- Animation scroll + compteurs ---------- */

  private animateCounter(element: HTMLElement, duration = 2000): void {
    const target = Number(element.dataset['target'] ?? '0');
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * target);
      element.textContent = current.toString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target.toString();
      }
    };

    requestAnimationFrame(step);
  }

  private initObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset['delay'] ?? '0';

            el.style.transitionDelay = `${Number(delay) / 1000}s`;
            el.classList.add('reveal--visible');

            if (el.classList.contains('stat-card')) {
              const numberEl =
                el.querySelector<HTMLElement>('.stat-card__number');
              if (numberEl && !numberEl.dataset['counted']) {
                numberEl.dataset['counted'] = 'true';
                this.animateCounter(numberEl);
              }
            }

            this.observer?.unobserve(el);
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = document.querySelectorAll<HTMLElement>(
      '.reveal:not(.reveal--visible)',
    );
    elements.forEach(el => this.observer?.observe(el));
  }

  ngAfterViewInit(): void {
    this.initObserver();
    this.animationsInitialized = true;
  }

  ngAfterViewChecked(): void {
    if (this.animationsInitialized) {
      this.initObserver();
    }
  }

  /* ---------- Navigation ---------- */

  goToCategory(slug: string): void {
    this.router.navigate(['/categorie', slug]);
  }

  goToProduct(id: string): void {
    this.router.navigate(['/details-produit', id]);
  }

  setCategory(cat: 'boubous' | 'robes' | 'ensembles' | 'accessoires'): void {
    this.activeCategory = cat;
  }

  /* ---------- Panier ---------- */

  addToCartFromHome(product: Product): void {
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

  /* ---------- Favoris ---------- */

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
      this.toastService.success(`${product.name} ajouté aux favoris ❤️`);
    } else {
      this.toastService.info(`${product.name} retiré des favoris`);
    }
  }

  // Helper pour obtenir l'URL de l'image
  getImageUrl(images: string[]): string {
    if (!images || images.length === 0) {
      return '/assets/placeholder.jpg';
    }
    // Si l'image commence par http, c'est une URL complète
    if (images[0].startsWith('http')) {
      return images[0];
    }
    // Sinon, c'est un chemin relatif vers le serveur backend
    return `${environment.mediaUrl}${images[0]}`;
  }

  // Filtrer les meilleures ventes selon l'onglet actif
  getFilteredBestSellers(): Product[] {
    return this.bestSellersProducts.filter(product => {
      const slug = product.category?.slug || '';
      switch (this.activeCategory) {
        case 'boubous':
          return slug.includes('boubou');
        case 'robes':
          return slug === 'robes';
        case 'ensembles':
          return slug === 'ensembles';
        case 'accessoires':
          return slug === 'accessoires';
        default:
          return false;
      }
    });
  }
}
