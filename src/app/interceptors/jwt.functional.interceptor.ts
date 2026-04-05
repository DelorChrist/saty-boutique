import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Obtenir le token du localStorage
  const token = localStorage.getItem('saty_auth_token');

  console.log(`[JWT Interceptor] Request to ${req.url}`);
  console.log(`[JWT Interceptor] Token found: ${!!token}`);

  // Cloner la requête et ajouter le header Authorization si token existe
  if (token) {
    console.log(`[JWT Interceptor] Attaching token to request`);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.warn('[JWT Interceptor] No token found in localStorage');
  }

  // Passer la requête au prochain handler
  return next(req).pipe(
    catchError((error) => {
      console.error('[HTTP Error]', error);

      // Si erreur 401 (Non autorisé)
      if (error.status === 401) {
        console.warn('401 Unauthorized - Redirecting to login');
        
        // Supprimer le token invalide
        localStorage.removeItem('saty_auth_token');
        localStorage.removeItem('saty_current_user');
        
        // Rediriger vers la page de connexion
        const currentUrl = router.url;
        if (currentUrl.includes('/admin')) {
          router.navigate(['/admin/login'], { 
            queryParams: { returnUrl: currentUrl }
          });
        } else {
          router.navigate(['/connexion'], { 
            queryParams: { returnUrl: currentUrl }
          });
        }
      }

      return throwError(() => error);
    })
  );
};