import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  minOrderAmount: number;
  expiryDate?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromoService {
  private apiUrl = `${environment.apiUrl}/promos`;
  private activePromosSubject = new BehaviorSubject<PromoCode[]>([]);
  public activePromos$ = this.activePromosSubject.asObservable();
  // Subject séparé pour déclencher le popup uniquement à la connexion
  private popupTriggerSubject = new BehaviorSubject<PromoCode[]>([]);
  public popupTrigger$ = this.popupTriggerSubject.asObservable();
  private hasSeenPromosKey = 'hasSeenPromos';

  constructor(private http: HttpClient) {}

  /**
   * Get active promo codes and trigger popup (for login only)
   */
  getActivePromoCodesWithPopup(): Observable<PromoCode[]> {
    return this.http.get<PromoCode[]>(`${this.apiUrl}/active`).pipe(
      tap(promos => {
        this.activePromosSubject.next(promos);
        this.popupTriggerSubject.next(promos);
      })
    );
  }

  /**
   * Get active promo codes silently (for list display, without triggering popup)
   */
  getActivePromoCodes(): Observable<PromoCode[]> {
    return this.http.get<PromoCode[]>(`${this.apiUrl}/active`).pipe(
      tap(promos => this.activePromosSubject.next(promos))
    );
  }

  /**
   * Validate a promo code
   */
  validatePromoCode(code: string, amount: number): Observable<PromoCode> {
    return this.http.post<PromoCode>(`${this.apiUrl}/validate`, { code, amount });
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(promo: PromoCode, orderAmount: number): number {
    if (promo.type === 'percentage') {
      return Math.round((orderAmount * promo.discount) / 100);
    }
    return promo.discount;
  }

  /**
   * Check if user has seen promo notification today
   */
  hasSeenPromosToday(): boolean {
    const lastSeen = localStorage.getItem(this.hasSeenPromosKey);
    if (!lastSeen) return false;
    
    const today = new Date().toDateString();
    return lastSeen === today;
  }

  /**
   * Mark that user has seen promo notification
   */
  markPromosSeen(): void {
    const today = new Date().toDateString();
    localStorage.setItem(this.hasSeenPromosKey, today);
  }

  /**
   * Check if promo is expired
   */
  isExpired(promo: PromoCode): boolean {
    if (!promo.expiryDate) return false;
    return new Date(promo.expiryDate) < new Date();
  }

  /**
   * Get discount display text
   */
  getDiscountText(promo: PromoCode): string {
    if (promo.type === 'percentage') {
      return `-${promo.discount}%`;
    }
    return `-${promo.discount} FCFA`;
  }

  /**
   * Format expiry date
   */
  formatExpiryDate(expiryDate: string): string {
    const date = new Date(expiryDate);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }
}
