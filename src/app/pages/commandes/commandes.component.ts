import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models/order.model';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.scss'],
})
export class CommandesComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  today = new Date();


  selectedStatus: OrderStatus | 'all' = 'all';
  searchQuery = '';
  selectedPeriod: 'all' | '7days' | '30days' | '90days' | 'year' = 'all';

  sortBy: 'date' | 'amount' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  stats = {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalSpent: 0,
  };

  statusFilters: { value: OrderStatus | 'all'; label: string; count: number }[] =
    [];

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/commandes' },
      });
      return;
    }

    this.loadOrders();
  }

  /* ========== CHARGEMENT DES DONNÉES ========== */

  private loadOrders(): void {
    this.ordersService.getMyOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.filteredOrders = [...this.orders];
        this.calculateStats();
        this.buildStatusFilters();
        this.applyFilters();
      },
      error: () => {
        this.orders = [];
        this.filteredOrders = [];
      }
    });
  }

  private calculateStats(): void {
    const stats = this.ordersService.getUserStats(this.orders);

    this.stats = {
      total: stats.totalOrders,
      pending: stats.pendingOrders,
      processing: stats.processingOrders,
      shipped: stats.shippedOrders,
      delivered: stats.deliveredOrders,
      cancelled: stats.cancelledOrders,
      totalSpent: stats.totalSpent,
    };
  }

  private buildStatusFilters(): void {
    this.statusFilters = [
      { value: 'all', label: 'Toutes', count: this.stats.total },
      { value: 'pending', label: 'En attente', count: this.stats.pending },
      {
        value: 'processing',
        label: 'En préparation',
        count: this.stats.processing,
      },
      { value: 'shipped', label: 'Expédiées', count: this.stats.shipped },
      { value: 'delivered', label: 'Livrées', count: this.stats.delivered },
      { value: 'cancelled', label: 'Annulées', count: this.stats.cancelled },
    ];
  }

  /* ========== FILTRES ========== */

  applyFilters(): void {
    let result = [...this.orders];

    if (this.selectedStatus !== 'all') {
      result = result.filter(o => o.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      result = this.ordersService.searchOrders(this.orders, this.searchQuery);
      if (this.selectedStatus !== 'all') {
        result = result.filter(o => o.status === this.selectedStatus);
      }
    }

    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (this.selectedPeriod) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      result = result.filter(o => new Date(o.createdAt) >= startDate);
    }

    result.sort((a, b) => {
      if (this.sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return this.sortOrder === 'desc'
          ? b.totalFcfa - a.totalFcfa
          : a.totalFcfa - b.totalFcfa;
      }
    });

    this.filteredOrders = result;
  }

  onStatusFilterChange(status: OrderStatus | 'all'): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onPeriodChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = 'all';
    this.searchQuery = '';
    this.selectedPeriod = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  /* ========== NAVIGATION ========== */

  goToOrderDetails(orderId: string): void {
    this.router.navigate(['/details-commande', orderId]);
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/details-produit', productId]);
  }

  /* ========== ACTIONS SUR LES COMMANDES ========== */

  canCancelOrder(order: Order): boolean {
    return this.ordersService.canCancelOrder(order);
  }

  async cancelOrder(order: Order, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = await this.confirmService.confirm(
      `Voulez-vous vraiment annuler la commande #${order.id} ?\n\nCette action est irréversible.`,
      'Annuler la commande',
      { confirmText: 'Annuler', cancelText: 'Retour', type: 'danger' }
    );

    if (!confirmed) return;

    this.ordersService.cancelOrder(order.id).subscribe({
      next: () => {
        this.toastService.success('Commande annulée avec succès');
        this.loadOrders();
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || "Impossible d'annuler cette commande");
      }
    });
  }

  /* ========== UTILITAIRES ========== */

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return this.ordersService.getStatusColor(status);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR');
  }

  getOrderItemsPreview(order: Order, max: number = 2): string {
    const items = order.items.slice(0, max).map((item: { name: string }) => item.name);
    const remaining = order.items.length - max;

    if (remaining > 0) {
      items.push(`+${remaining} autre${remaining > 1 ? 's' : ''}`);
    }

    return items.join(', ');
  }

  getProgressPercentage(order: Order): number {
    const statusProgress: Record<OrderStatus, number> = {
      pending: 20,
      confirmed: 40,
      processing: 60,
      shipped: 80,
      delivered: 100,
      cancelled: 0,
      refunded: 0,
    };

    return statusProgress[order.status] || 0;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.mediaUrl}${imagePath}`;
  }
}
