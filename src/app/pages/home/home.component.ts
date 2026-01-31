import {
  Component,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, AfterViewChecked {
  activeCategory: 'boubous' | 'robes' | 'ensembles' | 'accessoires' = 'boubous';

  private observer: IntersectionObserver | null = null;
  private animationsInitialized = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService,
  ) {}

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

  addToCartFromHome(product: {
    id: string;         // ✅ string
    name: string;
    price: number;
    image: string;
  }): void {
    this.cartService.addItem({
      productId: product.id,   // ✅ string
      name: product.name,
      price: product.price,
      image: product.image,
      size: null,
      color: null,
      quantity: 1,
    });

    alert(`${product.name} ajouté au panier !`);
  }

  /* ---------- Favoris ---------- */

  toggleFavorite(product: {
    id: string;         // ✅ string
    name: string;
    price: number;
    image: string;
    categorySlug?: string;
  }): void {
    const isFav = this.favoritesService.toggleFavorite({
      productId: product.id,   // ✅ string
      name: product.name,
      price: product.price,
      image: product.image,
      categorySlug: product.categorySlug || '',
      addedAt: new Date().toISOString(),
    });

    if (isFav) {
      alert(`${product.name} ajouté aux favoris ❤️`);
    } else {
      alert(`${product.name} retiré des favoris`);
    }
  }
}
