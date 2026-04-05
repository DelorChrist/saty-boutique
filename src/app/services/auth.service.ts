// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';
import { User } from '../models/user.model';
import { PromoService } from './promo.service';
import { InboxService } from './inbox.service';

import { environment } from '../../environments/environment';

const TOKEN_KEY = 'saty_auth_token';
const CURRENT_USER_KEY = 'saty_current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private promoService: PromoService, private inboxService: InboxService) {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      // Start notification polling if user is already logged in
      this.inboxService.startPolling();
      this.inboxService.getUnreadCount().subscribe();
      
      // Load promo codes to trigger popup on page reload (customer only)
      if (user.role === 'customer') {
        this.promoService.getActivePromoCodesWithPopup().subscribe();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem(TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  register(userData: any): Observable<any> {
    // Adapter les champs si nécessaire
    const payload = {
      firstName: userData.firstName || userData.fullName?.split(' ')[0] || 'Prénom',
      lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || 'Nom',
      email: userData.email,
      password: userData.password,
      role: 'customer'
    };

    return this.http.post<any>(`${this.apiUrl}/signup`, payload).pipe(
      tap(res => {
        console.log('Signup success response:', res);
      }),
      catchError(err => {
        console.error('Signup error in AuthService:', err);
        throw err;
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res.token && res.user) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          
          // Start notification polling
          this.inboxService.startPolling();
          this.inboxService.getUnreadCount().subscribe();
          
          // Load promo codes to trigger popup (customer only)
          if (res.user.role === 'customer') {
            this.promoService.getActivePromoCodesWithPopup().subscribe();
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
    this.inboxService.reset();
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  updateUserProfile(user: User): Observable<User> {
    const payload = {
      firstName: user.firstName || user.fullName?.split(' ')[0],
      lastName: user.lastName || user.fullName?.split(' ').slice(1).join(' '),
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      district: user.district
    };

    return this.http.put<User>(`${this.apiUrl}/profile`, payload).pipe(
      tap(updatedUser => {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  deleteCurrentUser(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`).pipe(
      tap(() => this.logout())
    );
  }

  // Compatibilité avec l'ancien code si nécessaire
  getCurrentUser(): User | null {
    return this.currentUserValue;
  }
}
