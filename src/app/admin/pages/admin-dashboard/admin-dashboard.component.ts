import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminProductService } from '../../services/admin-product.service';
import { OrdersService } from '../../../services/orders.service';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .dashboard {
      padding: 2rem;
    }

    .dashboard-header {
      margin-bottom: 2rem;
    }

    .dashboard-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }

    .dashboard-subtitle {
      color: #666;
      font-size: 0.95rem;
    }

    /* Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #f0f0f0;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .stat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon svg {
      width: 22px;
      height: 22px;
    }

    .stat-icon--red {
      background: rgba(229, 57, 53, 0.1);
      color: #e53935;
    }

    .stat-icon--blue {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .stat-icon--green {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.25rem;
    }

    .stat-change {
      font-size: 0.8rem;
      color: #4caf50;
      font-weight: 500;
    }

    /* Quick Actions */
    .quick-actions {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #f0f0f0;
    }

    .section-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      color: #1a1a1a;
    }

    .action-btn:hover {
      background: #e53935;
      color: white;
      border-color: #e53935;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(229, 57, 53, 0.2);
    }

    .action-icon {
      width: 24px;
      height: 24px;
    }

    .action-text {
      font-weight: 500;
      font-size: 0.95rem;
    }
  `],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Tableau de Bord</h1>
        <p class="dashboard-subtitle">Bienvenue dans votre espace d'administration (MAJ: 02:22)</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Total Produits</span>
            <div class="stat-icon stat-icon--red">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ productCount }}</div>
          <div class="stat-change">Produits en inventaire</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Commandes</span>
            <div class="stat-icon stat-icon--blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ orderCount }}</div>
          <div class="stat-change">Nouvelles commandes</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-label">Clients</span>
            <div class="stat-icon stat-icon--green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ customerCount }}</div>
          <div class="stat-change">{{ pendingCustomerCount }} en attente</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2 class="section-title">Actions Rapides</h2>
        <div class="actions-grid">
          <a routerLink="/admin/products/new" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="action-text">Nouveau Produit</span>
          </a>

          <a routerLink="/admin/products" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
            <span class="action-text">Voir Produits</span>
          </a>

          <a routerLink="/admin/orders" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="action-text">Gérer Commandes</span>
          </a>

          <a routerLink="/" class="action-btn">
            <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            <span class="action-text">Voir le Site</span>
          </a>
        </div>
      </div>

      <!-- Recent Registrations -->
      <div class="quick-actions" style="margin-top: 2rem;">
        <h2 class="section-title">Inscriptions Récentes (En attente)</h2>
        <div class="admin-table-container">
          <table class="admin-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left; background: #f5f5f5;">
                <th style="padding: 0.75rem;">Client</th>
                <th style="padding: 0.75rem;">Email</th>
                <th style="padding: 0.75rem;">Date</th>
                <th style="padding: 0.75rem;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of recentPendingCustomers" style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.75rem;">{{ customer.firstName }} {{ customer.lastName }}</td>
                <td style="padding: 0.75rem;">{{ customer.email }}</td>
                <td style="padding: 0.75rem;">{{ customer.createdAt | date:'dd/MM/yyyy' }}</td>
                <td style="padding: 0.75rem;">
                  <a routerLink="/admin/customers" style="color: #e53935; text-decoration: none; font-weight: 500;">
                    Gérer
                  </a>
                </td>
              </tr>
              <tr *ngIf="recentPendingCustomers.length === 0">
                <td colspan="4" style="padding: 2rem; text-align: center; color: #666;">
                  Aucune inscription en attente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  productCount = 0;
  orderCount = 0;
  totalRevenue = 0;
  customerCount = 0;
  pendingCustomerCount = 0;
  recentPendingCustomers: any[] = [];

  constructor(
    private productService: AdminProductService,
    private ordersService: OrdersService,
    private customerService: CustomerService
  ) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.productCount = products.length;
    });

    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        const stats = this.ordersService.getUserStats(orders);
        this.orderCount = stats.totalOrders;
        this.totalRevenue = stats.totalSpent;
      },
      error: () => {
        this.orderCount = 0;
        this.totalRevenue = 0;
      }
    });

    this.customerService.getCustomers().subscribe(customers => {
      this.customerCount = customers.length;
      this.pendingCustomerCount = customers.filter(c => c.status === 'pending').length;
      this.recentPendingCustomers = customers.filter(c => c.status === 'pending').slice(0, 5);
    });
  }
}


