import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
  variants: any[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewsCount: number;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  // Récupérer tous les produits actifs
  getProducts(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}?isActive=true`).pipe(
      map(response => response.products)
    );
  }

  // Récupérer les produits en vedette
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}?isFeatured=true&isActive=true`).pipe(
      map(response => response.products)
    );
  }

  // Récupérer les nouveaux produits
  getNewProducts(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}?isNew=true&isActive=true`).pipe(
      map(response => response.products)
    );
  }

  // Récupérer les meilleures ventes
  getBestSellers(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}?isBestSeller=true&isActive=true`).pipe(
      map(response => response.products)
    );
  }

  // Récupérer un produit par ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Récupérer un produit par slug
  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
  }

  // Récupérer les produits par catégorie
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}?categoryId=${categoryId}&isActive=true`).pipe(
      map(response => response.products)
    );
  }

  // Rechercher des produits
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(`${this.apiUrl}/search?q=${query}`).pipe(
      map(response => response.products)
    );
  }

  // Creer un produit (admin)
  createProduct(productData: FormData | Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  // Mettre a jour un produit (admin)
  updateProduct(id: string, productData: FormData | Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  // Supprimer un produit (admin)
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
