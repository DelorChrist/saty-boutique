import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  categorySlug: string;
  description?: string;
  isNew?: boolean;
}

type SortType = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recherche.component.html',
  styleUrls: ['./recherche.component.scss'],
})
export class RechercheComponent implements OnInit {
  searchQuery: string = '';
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  activeSortType: SortType = 'relevance';
  selectedCategory: string = 'all';

  // Filtres de prix
  minPrice: number = 0;
  maxPrice: number = 100000;
  priceRange: { min: number; max: number } = { min: 0, max: 100000 };

  // Catégories disponibles
  categories = [
    { slug: 'all', name: 'Toutes catégories' },
    { slug: 'boubous-hommes', name: 'Boubous Hommes' },
    { slug: 'boubous-femmes', name: 'Boubous Femmes' },
    { slug: 'robes', name: 'Robes' },
    { slug: 'ensembles', name: 'Ensembles' },
    { slug: 'chemises', name: 'Chemises' },
    { slug: 'chaussures', name: 'Chaussures' },
    { slug: 'tuniques', name: 'Tuniques' },
    { slug: 'chapeaux', name: 'Chapeaux' },
    { slug: 'accessoires', name: 'Accessoires' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    // Récupérer le terme de recherche depuis l'URL
    this.route.queryParamMap.subscribe(params => {
      this.searchQuery = params.get('q') || '';
      this.applyFilters();
    });
  }

  private loadProducts(): void {
    // MOCK produits - à remplacer par votre service
    this.allProducts = [
      {
        id: 'p1',
        name: 'Chemise moderne',
        price: 25000,
        image:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'chemises',
        description: 'Chemise élégante pour homme, tissu de qualité',
        isNew: true,
      },
      {
        id: 'p2',
        name: 'Robe africaine élégante',
        price: 35000,
        image:
          'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'robes',
        description: 'Belle robe africaine pour toutes occasions',
      },
      {
        id: 'p3',
        name: 'Ensemble pagne',
        price: 40000,
        image:
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'ensembles',
        description: 'Ensemble complet en pagne wax',
      },
      {
        id: 'p4',
        name: 'Boubou élégant',
        price: 32000,
        image:
          'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'boubous-hommes',
        description: 'Boubou traditionnel pour homme',
      },
      {
        id: 'p7',
        name: 'Boubou wax premium',
        price: 38000,
        image:
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'boubous-hommes',
        description: 'Boubou wax haut de gamme',
        isNew: true,
      },
      {
        id: 'p8',
        name: 'Boubou brodé',
        price: 42000,
        image:
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'boubous-hommes',
        description: 'Boubou avec broderies traditionnelles',
      },
      {
        id: 'p9',
        name: 'Robe pagne',
        price: 30000,
        image:
          'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'robes',
        description: 'Robe en pagne coloré',
      },
      {
        id: 'p13',
        name: 'Sac assorti',
        price: 18000,
        image:
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'accessoires',
        description: 'Sac à main assorti aux tenues',
      },
      {
        id: 'p14',
        name: 'Accessoires wax',
        price: 15000,
        image:
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'accessoires',
        description: 'Set d\'accessoires en wax',
        isNew: true,
      },
      {
        id: 'p15',
        name: 'Boubou femme wax',
        price: 36000,
        image:
          'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80',
        categorySlug: 'boubous-femmes',
        description: 'Boubou wax pour femme',
      },
    ];

    // Calculer min/max prix
    const prices = this.allProducts.map(p => p.price);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
    this.priceRange = { min: this.minPrice, max: this.maxPrice };
  }

  applyFilters(): void {
    let results = [...this.allProducts];

    // Filtre de recherche textuelle
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.categorySlug.toLowerCase().includes(query)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      results = results.filter(p => p.categorySlug === this.selectedCategory);
    }

    // Filtre par prix
    results = results.filter(
      p => p.price >= this.priceRange.min && p.price <= this.priceRange.max
    );

    this.filteredProducts = results;
    this.sortResults();
  }

  sortResults(): void {
    switch (this.activeSortType) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        // Garder l'ordre de pertinence par défaut
        break;
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(slug: string): void {
    this.selectedCategory = slug;
    this.applyFilters();
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  sortBy(type: SortType): void {
    this.activeSortType = type;
    this.sortResults();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.priceRange = { min: this.minPrice, max: this.maxPrice };
    this.applyFilters();
  }

  goToProduct(id: string): void {
    this.router.navigate(['/details-produit', id]);
  }

  addToCart(product: Product): void {
    this.cartService.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
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
      image: product.image,
      categorySlug: product.categorySlug,
      addedAt: new Date().toISOString(),
    });

    if (isFav) {
      alert(`${product.name} ajouté aux favoris ❤️`);
    } else {
      alert(`${product.name} retiré des favoris`);
    }
  }
}