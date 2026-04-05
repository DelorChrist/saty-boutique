import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .admin-container {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f5f5f5;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }

    .sidebar-header {
      padding: 1.5rem;
      background: rgba(229, 57, 53, 0.1);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }

    .sidebar-logo {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: white;
    }

    .sidebar-logo span {
      color: #e53935;
    }

    .sidebar-subtitle {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.6);
      margin-top: 0.25rem;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      font-size: 0.95rem;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.05);
      color: white;
      border-left-color: #e53935;
    }

    .nav-link.active {
      background: rgba(229, 57, 53, 0.15);
      color: white;
      border-left-color: #e53935;
      font-weight: 500;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      opacity: 0.9;
    }

    .nav-divider {
      margin: 0.5rem 1.5rem;
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    /* Footer */
    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }

    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      background: rgba(229, 57, 53, 0.2);
      border: 1px solid rgba(229, 57, 53, 0.3);
      border-radius: 0.5rem;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .logout-btn:hover {
      background: #e53935;
      border-color: #e53935;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 260px;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            Saty <span>Admin</span>
          </div>
          <div class="sidebar-subtitle">Panneau d'administration</div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Tableau de bord
          </a>
          
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Produits
          </a>

          <a routerLink="/admin/orders" routerLinkActive="active" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Commandes
          </a>

          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            Catégories
          </a>

          <a routerLink="/admin/promos" routerLinkActive="active" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Codes Promo
          </a>

          <a routerLink="/admin/customers" routerLinkActive="active" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            Clients
          </a>

          <hr class="nav-divider">

          <a routerLink="/" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Voir le site
          </a>
        </nav>

        <div class="sidebar-footer">
          <button (click)="logout()" class="logout-btn">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
