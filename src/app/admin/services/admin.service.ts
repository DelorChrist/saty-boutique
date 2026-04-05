import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// ========== INTERFACES ==========

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'manager';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  pendingOrders: number;
  revenueChange: number; // % change from last period
  ordersChange: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  totalSold: number;
  revenue: number;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  termsOfService?: string;
  privacyPolicy?: string;
  returnPolicy?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  district: string;
  city: string;
  cost: number;
  estimatedDays: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly ADMIN_USER_KEY = 'saty_admin_user';
  private readonly PROMO_CODES_KEY = 'saty_promo_codes';
  private readonly SITE_SETTINGS_KEY = 'saty_site_settings';
  private readonly DELIVERY_ZONES_KEY = 'saty_delivery_zones';

  private currentAdminSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentAdmin$ = this.currentAdminSubject.asObservable();

  constructor() {
    this.loadCurrentAdmin();
    this.initializeDefaultData();
  }

  /* ========== AUTHENTIFICATION ADMIN ========== */

  loginAdmin(email: string, password: string): AdminUser | null {
    console.warn('AdminService.loginAdmin is deprecated. Use AuthService.login with an admin account.');
    return null;
  }

  logoutAdmin(): void {
    localStorage.removeItem(this.ADMIN_USER_KEY);
    this.currentAdminSubject.next(null);
  }

  isAdminAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null;
  }

  getCurrentAdmin(): AdminUser | null {
    const stored = localStorage.getItem(this.ADMIN_USER_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private loadCurrentAdmin(): void {
    const admin = this.getCurrentAdmin();
    this.currentAdminSubject.next(admin);
  }

  /* ========== STATISTIQUES DASHBOARD ========== */

  getDashboardStats(): DashboardStats {
    const orders = this.getAllOrdersFromStorage();
    const products = this.getAllProductsFromStorage();
    const customers = this.getAllCustomersFromStorage();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lowStockProducts = products.filter((p) => p.stock < 5).length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length,
      totalCustomers: customers.length,
      lowStockProducts,
      pendingOrders,
      revenueChange: 12.5, // Simulé
      ordersChange: 8.3, // Simulé
    };
  }

  getSalesData(period: 'week' | 'month' | 'year'): SalesData[] {
    // Données simulées pour les graphiques
    const now = new Date();
    const data: SalesData[] = [];

    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 500000) + 100000,
        orders: Math.floor(Math.random() * 20) + 5,
      });
    }

    return data;
  }

  getTopProducts(limit: number = 5): TopProduct[] {
    const products = this.getAllProductsFromStorage();

    return products
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0] || '',
        totalSold: Math.floor(Math.random() * 100) + 10,
        revenue: p.price * (Math.floor(Math.random() * 100) + 10),
      }))
      .sort((a, b) => b.totalSold - a.totalSold);
  }

  /* ========== CODES PROMO ========== */

  getPromoCodes(): PromoCode[] {
    const stored = localStorage.getItem(this.PROMO_CODES_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored).map((p: any) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
        createdAt: new Date(p.createdAt),
      }));
    } catch {
      return [];
    }
  }

  createPromoCode(promo: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>): PromoCode {
    const promoCodes = this.getPromoCodes();

    const newPromo: PromoCode = {
      ...promo,
      id: `PROMO-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date(),
    };

    promoCodes.push(newPromo);
    localStorage.setItem(this.PROMO_CODES_KEY, JSON.stringify(promoCodes));

    return newPromo;
  }

  updatePromoCode(id: string, updates: Partial<PromoCode>): boolean {
    const promoCodes = this.getPromoCodes();
    const index = promoCodes.findIndex((p) => p.id === id);

    if (index === -1) return false;

    promoCodes[index] = { ...promoCodes[index], ...updates };
    localStorage.setItem(this.PROMO_CODES_KEY, JSON.stringify(promoCodes));

    return true;
  }

  deletePromoCode(id: string): boolean {
    const promoCodes = this.getPromoCodes();
    const filtered = promoCodes.filter((p) => p.id !== id);

    if (filtered.length === promoCodes.length) return false;

    localStorage.setItem(this.PROMO_CODES_KEY, JSON.stringify(filtered));
    return true;
  }

  validatePromoCode(code: string, orderAmount: number): { valid: boolean; discount: number; message: string } {
    const promoCodes = this.getPromoCodes();
    const promo = promoCodes.find(
      (p) => p.code.toUpperCase() === code.toUpperCase() && p.isActive
    );

    if (!promo) {
      return { valid: false, discount: 0, message: 'Code promo invalide' };
    }

    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      return { valid: false, discount: 0, message: 'Code promo expiré' };
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return { valid: false, discount: 0, message: 'Code promo épuisé' };
    }

    if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Montant minimum requis: ${promo.minOrderAmount} FCFA`,
      };
    }

    let discount = 0;
    if (promo.type === 'percentage') {
      discount = (orderAmount * promo.value) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.value;
    }

    return {
      valid: true,
      discount: Math.min(discount, orderAmount),
      message: 'Code promo appliqué avec succès',
    };
  }

  /* ========== PARAMÈTRES DU SITE ========== */

  getSiteSettings(): SiteSettings {
    const stored = localStorage.getItem(this.SITE_SETTINGS_KEY);
    if (!stored) {
      return this.getDefaultSettings();
    }

    try {
      return JSON.parse(stored);
    } catch {
      return this.getDefaultSettings();
    }
  }

  updateSiteSettings(settings: Partial<SiteSettings>): void {
    const current = this.getSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.SITE_SETTINGS_KEY, JSON.stringify(updated));
  }

  private getDefaultSettings(): SiteSettings {
    return {
      siteName: 'Saty Boutique',
      logo: '/assets/logo.png',
      email: 'contact@satyboutique.com',
      phone: '+225 07 00 00 00 00',
      address: 'Abidjan, Cocody Riviera',
      currency: 'FCFA',
      currencySymbol: 'FCFA',
      taxRate: 0,
      shippingCost: 1000,
      freeShippingThreshold: 50000,
      facebook: 'https://facebook.com/satyboutique',
      instagram: 'https://instagram.com/satyboutique',
      twitter: 'https://twitter.com/satyboutique',
    };
  }

  /* ========== ZONES DE LIVRAISON ========== */

  getDeliveryZones(): DeliveryZone[] {
    const stored = localStorage.getItem(this.DELIVERY_ZONES_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  createDeliveryZone(zone: Omit<DeliveryZone, 'id'>): DeliveryZone {
    const zones = this.getDeliveryZones();

    const newZone: DeliveryZone = {
      ...zone,
      id: `ZONE-${Date.now()}`,
    };

    zones.push(newZone);
    localStorage.setItem(this.DELIVERY_ZONES_KEY, JSON.stringify(zones));

    return newZone;
  }

  updateDeliveryZone(id: string, updates: Partial<DeliveryZone>): boolean {
    const zones = this.getDeliveryZones();
    const index = zones.findIndex((z) => z.id === id);

    if (index === -1) return false;

    zones[index] = { ...zones[index], ...updates };
    localStorage.setItem(this.DELIVERY_ZONES_KEY, JSON.stringify(zones));

    return true;
  }

  deleteDeliveryZone(id: string): boolean {
    const zones = this.getDeliveryZones();
    const filtered = zones.filter((z) => z.id !== id);

    if (filtered.length === zones.length) return false;

    localStorage.setItem(this.DELIVERY_ZONES_KEY, JSON.stringify(filtered));
    return true;
  }

  /* ========== UTILITAIRES PRIVÉS ========== */

  private getAllOrdersFromStorage(): any[] {
    const stored = localStorage.getItem('saty_orders');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private getAllProductsFromStorage(): any[] {
    const stored = localStorage.getItem('saty_products');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private getAllCustomersFromStorage(): any[] {
    const stored = localStorage.getItem('saty_users');
    if (!stored) return [];
    try {
      return JSON.parse(stored).filter((u: any) => u.role === 'customer');
    } catch {
      return [];
    }
  }

  private initializeDefaultData(): void {
    // Initialiser les paramètres par défaut si pas présents
    if (!localStorage.getItem(this.SITE_SETTINGS_KEY)) {
      this.updateSiteSettings(this.getDefaultSettings());
    }

    // Initialiser des codes promo par défaut
    if (!localStorage.getItem(this.PROMO_CODES_KEY)) {
      const defaultPromos: PromoCode[] = [
        {
          id: 'PROMO-DEFAULT-001',
          code: 'BIENVENUE10',
          description: 'Réduction de 10% pour les nouveaux clients',
          type: 'percentage',
          value: 10,
          minOrderAmount: 20000,
          maxDiscount: 5000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          usageCount: 0,
          isActive: true,
          createdAt: new Date(),
        },
      ];

      localStorage.setItem(this.PROMO_CODES_KEY, JSON.stringify(defaultPromos));
    }

    // Initialiser des zones de livraison par défaut
    if (!localStorage.getItem(this.DELIVERY_ZONES_KEY)) {
      const defaultZones: DeliveryZone[] = [
        {
          id: 'ZONE-001',
          name: 'Abidjan Centre',
          district: 'Plateau, Cocody, Marcory',
          city: 'Abidjan',
          cost: 1000,
          estimatedDays: 1,
          isActive: true,
        },
        {
          id: 'ZONE-002',
          name: 'Abidjan Périphérie',
          district: 'Abobo, Yopougon, Koumassi',
          city: 'Abidjan',
          cost: 1500,
          estimatedDays: 2,
          isActive: true,
        },
        {
          id: 'ZONE-003',
          name: 'Intérieur du pays',
          district: 'Bouaké, Yamoussoukro, San-Pedro',
          city: 'Autres villes',
          cost: 3000,
          estimatedDays: 3,
          isActive: true,
        },
      ];

      localStorage.setItem(this.DELIVERY_ZONES_KEY, JSON.stringify(defaultZones));
    }
  }
}
