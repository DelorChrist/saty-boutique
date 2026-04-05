import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../../services/orders.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule],
    styles: [`
    .order-list-container {
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.25rem;
    }

    .page-subtitle {
      color: #666;
      font-size: 0.95rem;
    }

    .table-container {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1px solid #f0f0f0;
      overflow: hidden;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table thead {
      background: #f9f9f9;
      border-bottom: 2px solid #e0e0e0;
    }

    .orders-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .orders-table td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .orders-table tbody tr:hover {
      background: #fafafa;
    }

    .order-id {
      font-family: monospace;
      font-size: 0.85rem;
      color: #666;
    }

    .order-date {
      font-size: 0.9rem;
      color: #666;
    }

    .order-amount {
      font-weight: 600;
      color: #e53935;
      font-size: 1rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .status-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .status-processing {
      background: #e3f2fd;
      color: #1565c0;
    }

    .status-confirmed {
      background: #e8f5e9;
      color: #1b5e20;
    }

    .status-shipped {
      background: #f3e5f5;
      color: #6a1b9a;
    }

    .status-delivered {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-cancelled {
      background: #ffebee;
      color: #c62828;
    }

    .status-refunded {
      background: #eceff1;
      color: #455a64;
    }

    .payment-badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .payment-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .payment-paid {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .payment-failed {
      background: #ffebee;
      color: #c62828;
    }

    .payment-refunded {
      background: #eceff1;
      color: #455a64;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e0e0e0;
      background: white;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-action svg {
      width: 18px;
      height: 18px;
    }

    .btn-view {
      color: #2196f3;
    }

    .btn-view:hover {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #999;
    }

    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    /* Modal Détails Commande */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(8px);
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(50px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      padding: 0;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 92%;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }

    .modal-content::-webkit-scrollbar {
      width: 10px;
    }

    .modal-content::-webkit-scrollbar-track {
      background: #f9f9f9;
      border-radius: 10px;
    }

    .modal-content::-webkit-scrollbar-thumb {
      background: #e53935;
      border-radius: 10px;
    }

    .modal-content::-webkit-scrollbar-thumb:hover {
      background: #d32f2f;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.75rem 2.5rem;
      background: linear-gradient(135deg, #e53935 0%, #d32f2f 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .modal-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-title::before {
      content: "📦";
      font-size: 2rem;
    }

    .btn-close {
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-close:hover {
      background: rgba(255,255,255,0.25);
      border-color: rgba(255,255,255,0.6);
      transform: rotate(90deg);
    }

    .detail-section {
      padding: 2rem 2.5rem;
      border-bottom: 1px solid #eee;
      flex-shrink: 0;
    }

    .detail-section:last-of-type {
      border-bottom: none;
      padding-bottom: 2.5rem;
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #111;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #eee;
    }

    .section-title::before {
      content: "";
      width: 4px;
      height: 1.5rem;
      background: #e53935;
      border-radius: 2px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .detail-item {
      padding: 1rem 1.25rem;
      background: #f9f9f9;
      border-radius: 0.75rem;
      border: 1px solid #eee;
      transition: all 0.3s ease;
    }

    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border-color: #ddd;
      background: #fff;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .detail-value {
      font-size: 1rem;
      color: #111;
      font-weight: 600;
    }

    .order-items {
      border: 1px solid #eee;
      border-radius: 0.75rem;
      overflow: hidden;
      background: white;
    }

    .order-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto;
      gap: 1.25rem;
      padding: 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      align-items: center;
      transition: background 0.2s ease;
    }

    .order-item:hover {
      background: #fafafa;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 0.75rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .item-details h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #111;
      margin-bottom: 0.35rem;
    }

    .item-details p {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    .item-quantity {
      font-size: 0.95rem;
      color: #333;
      background: #f9f9f9;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 600;
      border: 1px solid #eee;
    }

    .item-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: #e53935;
    }

    .total-summary {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
      background: #f9f9f9;
      border-radius: 0.75rem;
      margin-top: 1.5rem;
      border: 1px solid #eee;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      color: #333;
    }

    .summary-row span:last-child {
      font-weight: 600;
    }

    .summary-row.total {
      font-size: 1.35rem;
      font-weight: 800;
      color: #e53935;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
      border-top: 2px solid #ddd;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      padding: 1.5rem 2.5rem;
      background: #fff;
      position: sticky;
      bottom: 0;
      border-top: 1px solid #eee;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
      flex-shrink: 0;
    }

    .btn {
      padding: 0.875rem 1.75rem;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      flex: 1;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn:active {
      transform: scale(0.97);
    }

    .btn-confirm {
      background: #4caf50;
      color: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .btn-confirm:hover {
      background: #45a049;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .btn-cancel {
      background: #e53935;
      color: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .btn-cancel:hover {
      background: #d32f2f;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .btn-secondary {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover {
      background: #f9f9f9;
      border-color: #ccc;
    }
  `],
    template: `
    <div class="order-list-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestion des Commandes</h1>
          <p class="page-subtitle">Suivez et gérez toutes les commandes</p>
        </div>
      </div>

      <div class="table-container">
        <div *ngIf="loading" class="empty-state">
          <p>Chargement des commandes...</p>
        </div>

        <div *ngIf="!loading && errorMessage" class="empty-state">
          <p>{{ errorMessage }}</p>
        </div>

        <table class="orders-table">
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Date</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="orders.length === 0">
              <td colspan="7">
                <div class="empty-state">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <p>Aucune commande pour le moment</p>
                </div>
              </td>
            </tr>
            <tr *ngFor="let order of orders">
              <td>
                <span class="order-id">#{{ order.id.substring(0, 8) }}</span>
              </td>
              <td>
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
              </td>
              <td>
                <span>{{ getClientName(order) }}</span>
              </td>
              <td>
                <span class="order-amount">{{ order.totalFcfa }} FCFA</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + order.status">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td>
                <span class="payment-badge" [ngClass]="'payment-' + order.paymentStatus">
                  {{ getPaymentLabel(order.paymentStatus) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action btn-view" title="Voir détails" (click)="viewOrderDetails(order)">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Détails Commande -->
    <div class="modal-overlay" *ngIf="selectedOrder" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Commande #{{ selectedOrder.id.substring(0, 8) }}</h2>
          <button class="btn-close" (click)="closeModal()">✕</button>
        </div>

        <div class="detail-section">
          <h3 class="section-title">Informations générales</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Date de commande</div>
              <div class="detail-value">{{ formatDate(selectedOrder.createdAt) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Statut</div>
              <div class="detail-value">
                <span class="status-badge" [ngClass]="'status-' + selectedOrder.status">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Paiement</div>
              <div class="detail-value">
                <span class="payment-badge" [ngClass]="'payment-' + selectedOrder.paymentStatus">
                  {{ getPaymentLabel(selectedOrder.paymentStatus) }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Montant total</div>
              <div class="detail-value order-amount">{{ selectedOrder.totalFcfa }} FCFA</div>
            </div>
          </div>
        </div>

        <div class="detail-section" *ngIf="selectedOrder.user">
          <h3 class="section-title">Informations du client</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Nom du client</div>
              <div class="detail-value">{{ selectedOrder.user.firstName }} {{ selectedOrder.user.lastName }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Email</div>
              <div class="detail-value">{{ selectedOrder.user.email }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">Informations de livraison</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">Nom complet</div>
              <div class="detail-value">{{ selectedOrder.shippingAddress.fullName }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Téléphone</div>
              <div class="detail-value">{{ selectedOrder.shippingAddress.phone }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Ville</div>
              <div class="detail-value">{{ selectedOrder.shippingAddress.city }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Quartier</div>
              <div class="detail-value">{{ selectedOrder.shippingAddress.district }}</div>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
              <div class="detail-label">Adresse complète</div>
              <div class="detail-value">{{ selectedOrder.shippingAddress.address }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">Articles commandés</h3>
          <div class="order-items">
            <div class="order-item" *ngFor="let item of selectedOrder.items">
              <img [src]="getImageUrl(item.image)" [alt]="item.name" class="item-image">
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p>{{ item.price }} FCFA</p>
              </div>
              <div class="item-quantity">Qté: {{ item.quantity }}</div>
              <div class="item-price">{{ item.subtotal }} FCFA</div>
            </div>
          </div>

          <div class="total-summary">
            <div class="summary-row">
              <span>Sous-total</span>
              <span>{{ selectedOrder.subtotal }} FCFA</span>
            </div>
            <div class="summary-row">
              <span>Frais de livraison</span>
              <span>{{ selectedOrder.shippingCost }} FCFA</span>
            </div>
            <div class="summary-row" *ngIf="selectedOrder.discount">
              <span>Réduction</span>
              <span>-{{ selectedOrder.discount }} FCFA</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ selectedOrder.totalFcfa }} FCFA</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-confirm" 
                  *ngIf="selectedOrder.status === 'pending'" 
                  (click)="confirmOrder(selectedOrder.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Valider la commande
          </button>
          <button class="btn btn-cancel" 
                  *ngIf="selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed'" 
                  (click)="cancelOrder(selectedOrder.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Annuler la commande
          </button>
          <button class="btn btn-secondary" (click)="closeModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 14l-5 5m0 0l5 5m-5-5h18"></path>
            </svg>
            Fermer
          </button>
        </div>
      </div>
    </div>
  `
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  errorMessage: string | null = null;
  selectedOrder: Order | null = null;

  constructor(
    private ordersService: OrdersService,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des commandes.';
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeModal(): void {
    this.selectedOrder = null;
  }

  async confirmOrder(orderId: string): Promise<void> {
    console.log('🔵 confirmOrder called with ID:', orderId);
    
    const confirmed = await this.confirmService.confirm(
      'Voulez-vous valider cette commande ? Le client sera notifié.',
      'Valider la commande',
      { confirmText: 'Valider', type: 'info' }
    );

    console.log('🔵 User response:', confirmed);

    if (!confirmed) return;

    console.log('🔵 Calling updateOrderStatus...');
    this.ordersService.updateOrderStatus(orderId, 'confirmed').subscribe({
      next: () => {
        console.log('✅ Order status updated successfully');
        this.closeModal();
        this.loadOrders();
        setTimeout(() => {
          this.toastService.success('Commande validée avec succès ! Le client a été notifié.');
        }, 300);
      },
      error: (err) => {
        console.error('❌ Error updating order:', err);
        this.toastService.error(err.error?.message || 'Impossible de valider la commande');
      }
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    console.log('🔴 cancelOrder called with ID:', orderId);
    
    const confirmed = await this.confirmService.confirm(
      'Voulez-vous vraiment annuler cette commande ? Cette action est irréversible.',
      'Annuler la commande',
      { confirmText: 'Annuler', type: 'danger' }
    );

    console.log('🔴 User response:', confirmed);

    if (!confirmed) return;

    console.log('🔴 Calling updateOrderStatus...');
    this.ordersService.updateOrderStatus(orderId, 'cancelled').subscribe({
      next: () => {
        console.log('✅ Order cancelled successfully');
        this.closeModal();
        this.loadOrders();
        setTimeout(() => {
          this.toastService.success('Commande annulée avec succès.');
        }, 300);
      },
      error: (err) => {
        console.error('❌ Error cancelling order:', err);
        this.toastService.error(err.error?.message || 'Impossible d\'annuler la commande');
      }
    });
  }

  formatDate(dateValue: Date): string {
    const date = new Date(dateValue);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getClientName(order: Order): string {
    if (order.shippingAddress?.fullName) {
      return order.shippingAddress.fullName;
    }
    return 'Client #' + (order.userId?.substring(0, 8) || 'N/A');
  }

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  getPaymentLabel(status: Order['paymentStatus']): string {
    const labels: Record<Order['paymentStatus'], string> = {
      pending: 'En attente',
      paid: 'Payee',
      failed: 'Echouee',
      refunded: 'Remboursee'
    };
    return labels[status] || status;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.mediaUrl}${imagePath}`;
  }
}
