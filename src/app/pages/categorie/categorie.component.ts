import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

interface Product {
  id: string;          // ✅ string
  name: string;
  price: number;
  image: string;
  categorySlug: string;
}

interface Category {
  slug: string;
  name: string;
  description: string;
}

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

  private categories: Category[] = [
    {
      slug: 'boubous-hommes',
      name: 'Boubous Hommes',
      description: 'Collection de boubous élégants pour hommes, parfaits pour toutes occasions.',
    },
    {
      slug: 'boubous-femmes',
      name: 'Boubous Femmes',
      description: 'Boubous féminins modernes et traditionnels.',
    },
    {
      slug: 'robes',
      name: 'Robes',
      description: 'Robes africaines élégantes pour tous vos événements.',
    },
    {
      slug: 'ensembles',
      name: 'Ensembles',
      description: 'Ensembles complets pagne et bazin.',
    },
    {
      slug: 'chemises',
      name: 'Chemises',
      description: 'Chemises modernes et confortables.',
    },
    {
      slug: 'chaussures',
      name: 'Chaussures',
      description: 'Chaussures assorties à vos tenues africaines.',
    },
    {
      slug: 'tuniques',
      name: 'Tuniques',
      description: 'Tuniques légères et élégantes.',
    },
    {
      slug: 'chapeaux',
      name: 'Chapeaux',
      description: 'Chapeaux traditionnels et modernes.',
    },
    {
      slug: 'accessoires',
      name: 'Accessoires',
      description: 'Sacs, bijoux et accessoires wax.',
    },
  ];

  // ⚠️ ids passés en string (p1, p2, ...) pour être cohérents avec le reste
  private allProducts: Product[] = [
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
    {
      id: 'p19',
      name: 'Tunique légère',
      price: 28000,
      image:
        'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'tuniques',
    },
    {
      id: 'p21',
      name: 'Tunique brodée',
      price: 32000,
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'tuniques',
    },
    {
      id: 'p20',
      name: 'Chapeau traditionnel',
      price: 12000,
      image:
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'chapeaux',
    },
    {
      id: 'p22',
      name: 'Chapeau moderne',
      price: 15000,
      image:
        'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=900&q=80',
      categorySlug: 'chapeaux',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') ?? '';
      this.loadCategory();
      this.filterProducts();
    });
  }

  private loadCategory(): void {
    this.category = this.categories.find(c => c.slug === this.categorySlug) ?? null;
  }

  private filterProducts(): void {
    this.filteredProducts = this.allProducts.filter(
      p => p.categorySlug === this.categorySlug,
    );
    this.activeSortType = 'default';
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
        this.filterProducts();
        break;
    }
  }

  goToProduct(id: string): void {   // ✅ string
    this.router.navigate(['/details-produit', id]);
  }

  addToCart(product: Product): void {
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

  toggleFavorite(product: Product): void {
    const isFav = this.favoritesService.toggleFavorite({
      productId: product.id,   // ✅ string
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
