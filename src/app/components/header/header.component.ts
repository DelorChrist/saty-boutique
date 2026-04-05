// header.component.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
import { InboxService } from '../../services/inbox.service';
import { CategoryService, Category } from '../../services/category.service';
import { User } from '../../models/user.model';

interface ProductSuggestion {
  id: string;
  name: string;
  price: number;
  image: string;
  categorySlug: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showCategories = false;
  showAccountMenu = false;
  showHelpMenu = false;
  categories: Category[] = [];

  searchQuery = '';

  // Suggestions de recherche
  showSuggestions = false;
  suggestions: ProductSuggestion[] = [];

  // Tous les produits pour les suggestions
  private allProducts: ProductSuggestion[] = [
    {
      id: 'p1',
      name: 'Chemise moderne',
      price: 25000,
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'chemises',
    },
    {
      id: 'p2',
      name: 'Robe africaine élégante',
      price: 35000,
      image:
        'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'robes',
    },
    {
      id: 'p3',
      name: 'Ensemble pagne',
      price: 40000,
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'ensembles',
    },
    {
      id: 'p4',
      name: 'Boubou élégant',
      price: 32000,
      image:
        'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'boubous-hommes',
    },
    {
      id: 'p7',
      name: 'Boubou wax premium',
      price: 38000,
      image:
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'boubous-hommes',
    },
    {
      id: 'p8',
      name: 'Boubou brodé',
      price: 42000,
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'boubous-hommes',
    },
    {
      id: 'p9',
      name: 'Robe pagne',
      price: 30000,
      image:
        'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'robes',
    },
    {
      id: 'p10',
      name: 'Robe de soirée',
      price: 50000,
      image:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'robes',
    },
    {
      id: 'p11',
      name: 'Ensemble bazin',
      price: 55000,
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'ensembles',
    },
    {
      id: 'p13',
      name: 'Sac assorti',
      price: 18000,
      image:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'accessoires',
    },
    {
      id: 'p14',
      name: 'Accessoires wax',
      price: 15000,
      image:
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'accessoires',
    },
    {
      id: 'p15',
      name: 'Boubou femme wax',
      price: 36000,
      image:
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'boubous-femmes',
    },
    {
      id: 'p16',
      name: 'Boubou femme brodé',
      price: 42000,
      image:
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'boubous-femmes',
    },
    {
      id: 'p17',
      name: 'Chaussures traditionnelles',
      price: 22000,
      image:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'chaussures',
    },
    {
      id: 'p18',
      name: 'Sandales wax',
      price: 18000,
      image:
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'chaussures',
    },
  ];

  constructor(
    private router: Router,
    public cartService: CartService,
    public favoritesService: FavoritesService,
    public inboxService: InboxService,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {
    this.loadCategories();
    
    // Start notification polling when authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.inboxService.startPolling();
        this.inboxService.getUnreadCount().subscribe();
      } else {
        this.inboxService.reset();
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories dans le header:', err);
      }
    });
  }

  getCategoryIcon(slug: string): string {
    const iconMap: { [key: string]: string } = {
      'boubous-hommes': 'assets/icons/boubou-men.svg',
      'boubous-femmes': 'assets/icons/boubou-women.svg',
      'chaussures': 'assets/icons/shoes.svg',
      'tuniques': 'assets/icons/tunic.svg',
      'chapeaux': 'assets/icons/hat.svg',
      'accessoires': 'assets/icons/accessory.svg',
      'robes': 'assets/icons/robes.svg', // Fallback
      'ensembles': 'assets/icons/ensembles.svg', // Fallback
      'chemises': 'assets/icons/chemises.svg' // Fallback
    };
    return iconMap[slug] || 'assets/icons/accessory.svg';
  }

  /* --- Écouter les clics en dehors pour fermer les dropdowns --- */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-bar') && !target.closest('.suggestions')) {
      this.showSuggestions = false;
    }
  }

  /* --- Auth --- */

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  get greetingName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  logout(): void {
    this.authService.logout();
    this.showAccountMenu = false;
    this.router.navigate(['/']);
  }

  /* --- Toggles --- */

  toggleCategories(): void {
    this.showCategories = !this.showCategories;
    if (this.showCategories) {
      this.showAccountMenu = false;
      this.showHelpMenu = false;
    }
  }

  toggleAccountMenu(): void {
    this.showAccountMenu = !this.showAccountMenu;
    if (this.showAccountMenu) {
      this.showCategories = false;
      this.showHelpMenu = false;
    }
  }

  toggleHelpMenu(): void {
    this.showHelpMenu = !this.showHelpMenu;
    if (this.showHelpMenu) {
      this.showCategories = false;
      this.showAccountMenu = false;
    }
  }

  /* --- Navigation catégories --- */

  goToCategory(slug: string): void {
    this.router.navigate(['/categorie', slug]);
    this.showCategories = false;
  }

  /* --- Recherche avec suggestions --- */

  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();

    if (query.length < 2) {
      this.showSuggestions = false;
      this.suggestions = [];
      return;
    }

    // Filtrer les produits correspondants (max 5)
    this.suggestions = this.allProducts
      .filter(p => p.name.toLowerCase().includes(query))
      .slice(0, 5);

    this.showSuggestions = this.suggestions.length > 0;
  }

  onSearch(): void {
    const query = this.searchQuery?.trim();
    if (!query) return;

    this.showSuggestions = false;
    this.router.navigate(['/recherche'], { queryParams: { q: query } });
  }

  goToProductFromSuggestion(id: string): void {
    this.showSuggestions = false;
    this.searchQuery = '';
    this.router.navigate(['/details-produit', id]);
  }

  /* --- Bouton principal du menu compte --- */

  onAccountMainClick(): void {
    if (!this.isAuthenticated) {
      const currentUrl = this.router.url || '/';
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: currentUrl },
      });
    } else if (this.isAdmin) {
      // Rediriger les admins vers le dashboard admin
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/mon-compte']);
    }
    this.showAccountMenu = false;
  }

  /* --- Liens du menu compte --- */

  goToAccount(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/mon-compte' },
      });
    } else if (this.isAdmin) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/mon-compte']);
    }
    this.showAccountMenu = false;
  }

  goToOrders(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/commandes' },
      });
    } else if (this.isAdmin) {
      this.router.navigate(['/admin/commandes']);
    } else {
      this.router.navigate(['/commandes']);
    }
    this.showAccountMenu = false;
  }

  goToInbox(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/boite-reception' },
      });
    } else {
      this.router.navigate(['/boite-reception']);
    }
    this.showAccountMenu = false;
  }

  goToVouchers(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/bons-achats' },
      });
    } else {
      this.router.navigate(['/bons-achats']);
    }
    this.showAccountMenu = false;
  }

  goToFavorites(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/favoris' },
      });
    } else {
      this.router.navigate(['/favoris']);
    }
    this.showAccountMenu = false;
  }

  /* --- Panier --- */

  goToCart(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/panier' },
      });
    } else {
      this.router.navigate(['/panier']);
    }
  }

  /* --- Aide : WhatsApp & Chat --- */

  private whatsappNumber = '2250102030405';
  private whatsappDefaultMessage =
    "Bonjour, je souhaite avoir plus d'informations sur vos produits.";

  openWhatsApp(): void {
    const encodedMessage = encodeURIComponent(this.whatsappDefaultMessage);
    const url = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  }

  openLiveChat(): void {
    this.router.navigate(['/chat']);
  }

  /* --- Liens texte du menu Aide --- */

  goToCentreAssistance(): void {
    this.router.navigate(['/centre-assistance']);
    this.showHelpMenu = false;
  }

  goToCommentCommander(): void {
    this.router.navigate(['/comment-commander']);
    this.showHelpMenu = false;
  }

  goToCommentPayer(): void {
    this.router.navigate(['/comment-payer']);
    this.showHelpMenu = false;
  }

  goToBoutiqueCocody(): void {
    this.router.navigate(['/boutique-cocody']);
    this.showHelpMenu = false;
  }
}