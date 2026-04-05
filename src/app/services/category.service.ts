import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    isActive: boolean;
    displayOrder: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`;

    constructor(private http: HttpClient) { }

    // Récupérer toutes les catégories actives
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}?isActive=true`);
    }

    // Récupérer une catégorie par ID
    getCategoryById(id: string): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/${id}`);
    }

    // Récupérer une catégorie par slug
    getCategoryBySlug(slug: string): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/slug/${slug}`);
    }

    // Creer une categorie (admin)
    createCategory(categoryData: FormData | Partial<Category>): Observable<Category> {
        return this.http.post<Category>(this.apiUrl, categoryData);
    }

    // Mettre a jour une categorie (admin)
    updateCategory(id: string, categoryData: FormData | Partial<Category>): Observable<Category> {
        return this.http.put<Category>(`${this.apiUrl}/${id}`, categoryData);
    }

    // Supprimer une categorie (admin)
    deleteCategory(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
