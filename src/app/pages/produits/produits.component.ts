import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

interface Product {
  id: string;          // ✅ string
  name: string;
  price: number;
  image: string;
  categorySlug: string;
  isNew?: boolean;
}

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
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  // Catégories pour le filtre
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
    private router: Router,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.applyFilters();
  }

  private loadProducts(): void {
    // MOCK produits (à remplacer par service/Firebase)
    this.allProducts = [
      { id: 'p1', name: 'Chemise moderne',        price: 25000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', categorySlug: 'chemises',        isNew: true },
      { id: 'p2', name: 'Robe africaine élégante',price: 35000, image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80', categorySlug: 'robes' },
      { id: 'p3', name: 'Ensemble pagne',         price: 40000, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80', categorySlug: 'ensembles' },
      { id: 'p4', name: 'Boubou élégant',         price: 32000, image: 'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80', categorySlug: 'boubous-hommes' },
      { id: 'p5', name: 'Tenue de soirée',        price: 45000, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80', categorySlug: 'robes' },
      { id: 'p6', name: 'Ensemble casual',        price: 28000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', categorySlug: 'ensembles' },
      { id: 'p7', name: 'Boubou wax premium',     price: 38000, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', categorySlug: 'boubous-hommes', isNew: true },
      { id: 'p8', name: 'Boubou brodé',           price: 42000, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80', categorySlug: 'boubous-hommes' },
      { id: 'p9', name: 'Robe pagne',             price: 30000, image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80', categorySlug: 'robes' },
      { id: 'p10',name: 'Robe de soirée',         price: 50000, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', categorySlug: 'robes' },
      { id: 'p11',name: 'Ensemble bazin',         price: 55000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', categorySlug: 'ensembles' },
      { id: 'p12',name: 'Ensemble casual',        price: 32000, image: 'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80', categorySlug: 'ensembles' },
      { id: 'p13',name: 'Sac assorti',            price: 18000, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', categorySlug: 'accessoires' },
      { id: 'p14',name: 'Accessoires wax',        price: 15000, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80', categorySlug: 'accessoires',     isNew: true },
      { id: 'p15',name: 'Boubou femme wax',       price: 36000, image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80', categorySlug: 'boubous-femmes' },
      { id: 'p16',name: 'Boubou femme brodé',     price: 42000, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80', categorySlug: 'boubous-femmes' },
      { id: 'p17',name: 'Chaussures traditionnelles', price: 22000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', categorySlug: 'chaussures' },
      { id: 'p18',name: 'Sandales wax',           price: 18000, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80', categorySlug: 'chaussures' },
      { id: 'p19',name: 'Tunique légère',         price: 28000, image: 'https://images.unsplash.com/photo-1490111718993-d98654ce6cf7?auto=format&fit=crop&w=900&q=80', categorySlug: 'tuniques' },
      { id: 'p20',name: 'Chapeau traditionnel',   price: 12000, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80', categorySlug: 'chapeaux' },
      { id: 'p21',name: 'Tunique brodée',         price: 32000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', categorySlug: 'tuniques' },
      { id: 'p22',name: 'Chapeau moderne',        price: 15000, image: 'https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=900&q=80', categorySlug: 'chapeaux' },
    ];
  }

  private applyFilters(): void {
    // Filtre par catégorie
    if (this.selectedCategory === 'all') {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(
        p => p.categorySlug === this.selectedCategory,
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
      productId: product.id,  // ✅ string
      name: product.name,
      price: product.price,
      image: product.image,
      size: null,
      color: null,
      quantity: 1,
    });

    alert(`${product.name} ajouté au panier !`);
  }
}
