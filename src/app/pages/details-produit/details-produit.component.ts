import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  images: string[]; // 🔥 Tableau d'images pour le carrousel
  description: string;
  sizes: string[];
  colors: string[];
  categorySlug?: string;
  features?: string[]; // Caractéristiques du produit
  stock?: number;
  rating?: number;
  reviews?: number;
}

@Component({
  selector: 'app-details-produit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-produit.component.html',
  styleUrls: ['./details-produit.component.scss'],
})
export class DetailsProduitComponent implements OnInit {
  product: Product | null = null;
  suggestedProducts: Product[] = [];

  selectedSize: string | null = null;
  selectedColor: string | null = null;

  // 🎯 CARROUSEL D'IMAGES
  currentImageIndex: number = 0;
  selectedImage: string = '';

  // Quantité actuelle dans le panier
  currentQuantity: number | null = null;

  // Zoom image
  isZoomed = false;

  private allProducts: Product[] = [
    {
      id: 'p1',
      brand: 'Saty Boutique',
      name: 'Chemise moderne élégante',
      price: 25000,
      oldPrice: 30000,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=80',
      ],
      description:
        'Chemise moderne en tissu léger et respirant, parfaite pour le quotidien et les sorties décontractées. Coupe ajustée qui met en valeur la silhouette tout en restant confortable.',
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Bleu ciel', 'Blanc cassé', 'Gris anthracite'],
      categorySlug: 'chemises',
      features: [
        'Tissu 100% coton premium',
        'Coupe moderne ajustée',
        'Col classique italien',
        'Boutons de qualité',
        'Entretien facile',
      ],
      stock: 15,
      rating: 4.5,
      reviews: 28,
    },
    {
      id: 'p2',
      brand: 'Saty Boutique',
      name: 'Robe africaine élégante',
      price: 35000,
      oldPrice: 42000,
      images: [
        'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&w=900&q=80',
      ],
      description:
        'Robe africaine élégante avec motifs modernes, parfaite pour vos cérémonies et événements spéciaux. Coupe flatteuse qui sublime toutes les morphologies.',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Rouge passion', 'Vert émeraude', 'Or royal'],
      categorySlug: 'robes',
      features: [
        'Tissu wax authentique',
        'Doublure intérieure',
        'Fermeture éclair invisible',
        'Coupe évasée',
        'Fabriqué en Côte d\'Ivoire',
      ],
      stock: 8,
      rating: 4.8,
      reviews: 42,
    },
    {
      id: 'p3',
      brand: 'Saty Boutique',
      name: 'Ensemble pagne complet',
      price: 40000,
      oldPrice: 45000,
      images: [
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=900&q=80',
      ],
      description:
        'Ensemble pagne complet comprenant haut et bas assortis. Coupe confortable et tissus de qualité supérieure pour un style authentique et raffiné.',
      sizes: ['M', 'L', 'XL'],
      colors: ['Multicolore'],
      categorySlug: 'ensembles',
      features: [
        'Ensemble 2 pièces',
        'Pagne wax premium',
        'Finitions soignées',
        'Coupe confortable',
      ],
      stock: 12,
      rating: 4.6,
      reviews: 19,
    },
    {
      id: 'p4',
      brand: 'Saty Boutique',
      name: 'Boubou élégant traditionnel',
      price: 32000,
      oldPrice: 36000,
      images: [
        'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1564859228273-274232fdb516?auto=format&fit=crop&w=900&q=80',
      ],
      description:
        'Boubou traditionnel revisité avec une touche moderne. Parfait pour toutes vos occasions importantes : mariages, baptêmes, cérémonies.',
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: ['Noir élégant', 'Bordeaux royal', 'Bleu nuit'],
      categorySlug: 'boubous-hommes',
      features: [
        'Tissu bazin riche',
        'Broderies traditionnelles',
        'Coupe ample confortable',
        'Livré avec pantalon assorti',
      ],
      stock: 20,
      rating: 4.7,
      reviews: 35,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.product = this.allProducts.find(p => p.id === id) ?? null;

      if (this.product) {
        // Initialiser l'image principale
        this.selectedImage = this.product.images[0];
        this.currentImageIndex = 0;

        // Sélections par défaut
        this.selectedSize = this.product.sizes[0] ?? null;
        this.selectedColor = this.product.colors[0] ?? null;

        this.buildSuggestions();
        this.syncCurrentQuantity();
      } else {
        this.suggestedProducts = [];
        this.currentQuantity = null;
      }
    });
  }

  /* ========== CARROUSEL D'IMAGES ========== */

  selectImage(index: number): void {
    if (!this.product) return;
    this.currentImageIndex = index;
    this.selectedImage = this.product.images[index];
  }

  nextImage(): void {
    if (!this.product) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
    this.selectedImage = this.product.images[this.currentImageIndex];
  }

  prevImage(): void {
    if (!this.product) return;
    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.product.images.length - 1
        : this.currentImageIndex - 1;
    this.selectedImage = this.product.images[this.currentImageIndex];
  }

  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
  }

  /* ========== PANIER ========== */

  private syncCurrentQuantity(): void {
    if (!this.product) {
      this.currentQuantity = null;
      return;
    }
    const items = this.cartService.getItems();
    const found =
      items.find(
        i =>
          i.productId === this.product!.id &&
          i.size === this.selectedSize &&
          i.color === this.selectedColor
      ) ?? null;
    this.currentQuantity = found ? found.quantity : null;
  }

  get currentCartItem(): CartItem | null {
    if (!this.product) {
      this.currentQuantity = null;
      return null;
    }
    const items = this.cartService.getItems();
    const found =
      items.find(
        i =>
          i.productId === this.product!.id &&
          i.size === this.selectedSize &&
          i.color === this.selectedColor
      ) ?? null;
    this.currentQuantity = found ? found.quantity : null;
    return found;
  }

  /* ========== SUGGESTIONS ========== */

  private buildSuggestions(): void {
    if (!this.product) {
      this.suggestedProducts = [];
      return;
    }

    const currentId = this.product.id;
    const currentCategory = this.product.categorySlug;

    let related = this.allProducts.filter(
      p =>
        p.id !== currentId &&
        p.categorySlug &&
        p.categorySlug === currentCategory
    );

    if (related.length < 4) {
      const others = this.allProducts.filter(p => p.id !== currentId);
      for (const p of others) {
        if (related.length >= 4) break;
        if (!related.find(r => r.id === p.id)) {
          related.push(p);
        }
      }
    }

    this.suggestedProducts = related.slice(0, 4);
  }

  /* ========== SÉLECTIONS ========== */

  changeSize(size: string): void {
    this.selectedSize = size;
    this.syncCurrentQuantity();
  }

  changeColor(color: string): void {
    this.selectedColor = color;
    this.syncCurrentQuantity();
  }

  /* ========== FAVORIS ========== */

  get isFavorite(): boolean {
    if (!this.product) return false;
    return this.favoritesService.isFavorite(this.product.id);
  }

  toggleFavorite(): void {
    if (!this.product) return;

    const isFav = this.favoritesService.toggleFavorite({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0],
      categorySlug: this.product.categorySlug ?? '',
      addedAt: new Date().toISOString(),
    });

    if (isFav) {
      alert(`${this.product.name} ajouté aux favoris ❤️`);
    } else {
      alert(`${this.product.name} retiré des favoris`);
    }
  }

  /* ========== ACTIONS PANIER ========== */

  addToCart(): void {
    if (!this.product) return;
    if (!this.selectedSize && this.product.sizes.length) {
      alert('Veuillez choisir une taille.');
      return;
    }
    if (!this.selectedColor && this.product.colors.length) {
      alert('Veuillez choisir une couleur.');
      return;
    }

    this.cartService.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0],
      size: this.selectedSize ?? null,
      color: this.selectedColor ?? null,
      quantity: 1,
    });

    this.syncCurrentQuantity();
    alert(`${this.product.name} ajouté au panier !`);
  }

  changeCartQuantity(delta: number): void {
    const item = this.currentCartItem;
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    item.quantity = newQty;
    this.currentQuantity = newQty;
    this.cartService.updateCart();
  }

  /* ========== SUGGESTIONS ACTIONS ========== */

  addSuggestedToCart(sp: Product): void {
    this.cartService.addItem({
      productId: sp.id,
      name: sp.name,
      price: sp.price,
      image: sp.images[0],
      size: null,
      color: null,
      quantity: 1,
    });

    alert(`${sp.name} ajouté au panier !`);
  }

  goToProduct(id: string): void {
    this.router.navigate(['/details-produit', id]);
  }

  /* ========== ÉTOILES NOTATION ========== */

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }
}