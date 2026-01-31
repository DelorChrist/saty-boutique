import { Injectable } from '@angular/core';
import { Product, CategorySlug } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // TODO: à remplir avec de vrais produits plus tard
 private products: Product[] = [
  {
    id: 'p1',
    slug: 'robe-saty-cote-divoire',
    name: 'Robe Saty Côte d’Ivoire',
    description: 'Robe rouge et blanche inspirée des tenues ivoiriennes, idéale pour les cérémonies.',
    priceFcfa: 34900,
    category: 'boubous-femmes',
    images: ['assets/images/robe-saty-1.jpg'],
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'p2',
    slug: 'boubou-homme-traditionnel-rouge',
    name: 'Boubou homme traditionnel rouge',
    description: 'Boubou homme coupe moderne, tissu de qualité, confection locale.',
    priceFcfa: 39900,
    category: 'boubous-hommes',
    images: ['assets/images/boubou-homme-rouge.jpg'],
    isFeatured: true,
  },
  {
    id: 'p3',
    slug: 'sandales-rouges-femme',
    name: 'Sandales rouges femme',
    description: 'Sandales élégantes assorties aux tenues Saty Boutique.',
    priceFcfa: 15900,
    category: 'chaussures',
    images: ['assets/images/sandales-rouges.jpg'],
    isNew: true,
  },
  {
    id: 'p4',
    slug: 'tunique-blanche-homme',
    name: 'Tunique blanche homme',
    description: 'Tunique blanche minimaliste pour vos sorties et événements.',
    priceFcfa: 27900,
    category: 'tuniques',
    images: ['assets/images/tunique-blanche-homme.jpg'],
  },
];


  getAll(): Product[] {
    return this.products;
  }

  getFeatured(): Product[] {
    return this.products.filter((p) => p.isFeatured);
  }

  getNew(): Product[] {
    return this.products.filter((p) => p.isNew);
  }

  getByCategory(category: CategorySlug): Product[] {
    return this.products.filter((p) => p.category === category);
  }

  getBySlug(slug: string): Product | null {
    return this.products.find((p) => p.slug === slug) ?? null;
  }

  search(term: string): Product[] {
    const q = term.toLowerCase().trim();
    if (!q) return this.products;
    return this.products.filter((p) =>
      (p.name + p.description).toLowerCase().includes(q)
    );
  }
}
