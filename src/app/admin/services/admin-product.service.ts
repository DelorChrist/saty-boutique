import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  variants: ProductVariant[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  priceAdjustment: number;
  sku: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId?: string;
  isActive: boolean;
  displayOrder: number;
  productsCount?: number;
}


@Injectable({
  providedIn: 'root',
})
export class AdminProductService {
  private apiUrl = environment.apiUrl + '/products';
  private categoriesUrl = environment.apiUrl + '/categories';

  constructor(private http: HttpClient) { }

  /* ========== GESTION DES PRODUITS ========== */

  getAllProducts(): Observable<Product[]> {
    return this.http.get<{ products: Product[] }>(this.apiUrl).pipe(
      map(response => response.products)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Toggle status requires fetching or partial update. Assuming toggle by updating.
  toggleProductStatus(product: Product): Observable<Product> {
    // We can send a partial update or full update.
    // If backend supports PATCH, we do that. For now PUT with full data or partial if backend handles it.
    // My backend implementation of updateProduct merges properties, so we can send just { isActive: !status }
    // but the backend expects multipart/form-data for updates because of image upload middleware if used on same route?
    // Wait, my backend implementation for PUT uses upload.array().
    // If I send JSON, multer might not parse it if it expects multipart.
    // But express.json() is there.
    // Let's safe-check: if I use FormData it works. If I use JSON, I need to check if multer middleware blocks JSON.
    // Usually multer .array() creates req.body from text fields. If I send application/json, multer might ignore it or error.
    // To be safe, I'll send direct JSON request to an endpoint or use FormData.
    // My route: router.route('/:id').put(upload.array('images', 5), productController.updateProduct)
    // Multer will parse multipart. If I send application/json, req.body might be empty or populated by express.json() BEFORE multer?
    // Actually express.json() is before multer ? No, usually order matters.
    // In my app.js: app.use(express.json()); ... app.use('/api', routes);
    // So express.json() runs. If Content-Type is application/json, it parses it.
    // Multer runs on the route.
    // Generally, mixing them works if Multer doesn't throw on non-multipart.
    // I'll try sending JSON object for simple status updates.

    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, { isActive: !product.isActive });
  }

  updateStock(id: string, newStock: number): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, { stock: newStock });
  }

  /* ========== GESTION DES CATÉGORIES ========== */

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.categoriesUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`);
  }

  /* ========== GESTION DES CODES PROMO ========== */

  getAllPromos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/promos`);
  }

  createPromo(promo: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/promos`, promo);
  }

  updatePromo(id: string, promo: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/promos/${id}`, promo);
  }

  deletePromo(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/promos/${id}`);
  }
}
