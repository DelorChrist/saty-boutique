import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { ProductService, Product } from '../../services/product.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../services/toast.service';

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
  loading = true;

  selectedSize: string | null = null;
  selectedColor: string | null = null;

  // Carrousel d'images
  currentImageIndex: number = 0;
  selectedImage: string = '';

  // Quantité actuelle dans le panier
  currentQuantity: number | null = null;

  // Zoom image
  isZoomed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService,
    private productService: ProductService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;

        // Initialiser l'image principale
        if (product.images && product.images.length > 0) {
          this.selectedImage = this.getImageUrl(product.images[0]);
          this.currentImageIndex = 0;
        }

        // Sélections par défaut basées sur les variantes
        if (product.variants && product.variants.length > 0) {
          const firstVariant = product.variants[0];
          this.selectedSize = firstVariant.size || null;
          this.selectedColor = firstVariant.color || null;
        }

        this.loadSuggestions();
        this.syncCurrentQuantity();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du produit:', err);
        this.loading = false;
        this.product = null;
      }
    });
  }

  private loadSuggestions(): void {
    if (!this.product) return;

    // Charger les produits de la même catégorie
    if (this.product.categoryId) {
      this.productService.getProductsByCategory(this.product.categoryId).subscribe({
        next: (products) => {
          this.suggestedProducts = products
            .filter(p => p.id !== this.product!.id)
            .slice(0, 4);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des suggestions:', err);
        }
      });
    }
  }

  /* ========== CARROUSEL D'IMAGES ========== */

  selectImage(index: number): void {
    if (!this.product) return;
    this.currentImageIndex = index;
    this.selectedImage = this.getImageUrl(this.product.images[index]);
  }

  nextImage(): void {
    if (!this.product || !this.product.images) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
    this.selectedImage = this.getImageUrl(this.product.images[this.currentImageIndex]);
  }

  prevImage(): void {
    if (!this.product || !this.product.images) return;
    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.product.images.length - 1
        : this.currentImageIndex - 1;
    this.selectedImage = this.getImageUrl(this.product.images[this.currentImageIndex]);
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
      image: this.product.images[0] || '',
      categorySlug: this.product.category?.slug ?? '',
      addedAt: new Date().toISOString(),
    });

    if (isFav) {
      this.toastService.success(`${this.product.name} ajouté aux favoris ❤️`);
    } else {
      this.toastService.info(`${this.product.name} retiré des favoris`);
    }
  }

  /* ========== ACTIONS PANIER ========== */

  addToCart(): void {
    if (!this.product) return;

    this.cartService.addItem({
      productId: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images[0] || '',
      size: this.selectedSize ?? null,
      color: this.selectedColor ?? null,
      quantity: 1,
    });

    this.syncCurrentQuantity();
    this.toastService.success(`${this.product.name} ajouté au panier !`);
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
      image: sp.images[0] || '',
      size: null,
      color: null,
      quantity: 1,
    });

    this.toastService.success(`${sp.name} ajouté au panier !`);
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

  /* ========== HELPERS ========== */

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.mediaUrl}${imagePath}`;
  }

  // Extraire les tailles disponibles depuis les variantes
  get availableSizes(): string[] {
    if (!this.product || !this.product.variants) return [];
    const sizes = this.product.variants
      .map(v => v.size)
      .filter((s): s is string => !!s);
    return [...new Set(sizes)];
  }

  // Extraire les couleurs disponibles depuis les variantes
  get availableColors(): string[] {
    if (!this.product || !this.product.variants) return [];
    const colors = this.product.variants
      .map(v => v.color)
      .filter((c): c is string => !!c);
    return [...new Set(colors)];
  }
}