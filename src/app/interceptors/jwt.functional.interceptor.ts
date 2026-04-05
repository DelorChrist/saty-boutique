import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = sessionStorage.getItem('saty_auth_token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        sessionStorage.removeItem('saty_auth_token');
        sessionStorage.removeItem('saty_current_user');

        const currentUrl = router.url;
        if (currentUrl.includes('/admin')) {
          router.navigate(['/admin/login'], { queryParams: { returnUrl: currentUrl } });
        } else {
          router.navigate(['/connexion'], { queryParams: { returnUrl: currentUrl } });
        }
      }

      if (error.status === 429) {
        const retryAfter = error.headers?.get('RateLimit-Reset');
        error = { ...error, userMessage: error.error?.message || 'Trop de tentatives, veuillez patienter.' };
      }
      return throwError(() => error);
    })
  );
};
