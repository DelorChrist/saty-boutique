import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAdmin()) {
      // Rediriger vers la page de connexion admin
      this.router.navigate(['/admin/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    return true;
  }
}
