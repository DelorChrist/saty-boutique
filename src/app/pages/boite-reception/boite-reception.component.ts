import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InboxService, InboxNotification } from '../../services/inbox.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-boite-reception',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inbox-container">
      <div class="inbox-header">
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
          </svg>
          Boîte de réception
        </h1>
        <div class="header-actions">
          <button class="btn-mark-all" (click)="markAllAsRead()" *ngIf="hasUnread()" title="Tout marquer comme lu">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Tout marquer comme lu
          </button>
        </div>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des notifications...</p>
      </div>

      <div class="empty-inbox" *ngIf="!loading && notifications.length === 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path>
        </svg>
        <h3>Aucune notification</h3>
        <p>Vous n'avez pas encore de notifications. Revenez ici pour suivre l'état de vos commandes !</p>
      </div>

      <div class="notifications-list" *ngIf="!loading && notifications.length > 0">
        <div *ngFor="let notification of notifications" 
             class="notification-card" 
             [class.unread]="!notification.isRead"
             (click)="handleNotificationClick(notification)">
          
          <div class="notification-icon" [style.background]="getColor(notification.type)">
            {{ getIcon(notification.type) }}
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h3>{{ notification.title }}</h3>
              <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
            </div>
            
            <p class="notification-message">{{ notification.message }}</p>
            
            <div class="notification-meta" *ngIf="notification.order">
              <span class="order-badge">
                Commande #{{ notification.order.orderNumber }}
              </span>
              <span class="amount">
                {{ notification.order.totalAmount }} FCFA
              </span>
            </div>
          </div>

          <div class="notification-actions" (click)="$event.stopPropagation()">
            <button class="btn-action" (click)="deleteNotification(notification)" title="Supprimer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <div class="unread-indicator" *ngIf="!notification.isRead"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inbox-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
      min-height: 80vh;
    }

    .inbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #ecf0f1;
    }

    .inbox-header h1 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 2rem;
      color: #2c3e50;
      margin: 0;
    }

    .inbox-header h1 svg {
      color: #e53935;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-mark-all {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: #ecf0f1;
      color: #2c3e50;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-mark-all:hover {
      background: #bdc3c7;
      transform: translateY(-2px);
    }

    .loading {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #e53935;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-inbox {
      text-align: center;
      padding: 5rem 2rem;
      background: #f8f9fa;
      border-radius: 16px;
      margin: 2rem 0;
    }

    .empty-inbox svg {
      color: #bdc3c7;
      margin-bottom: 1.5rem;
    }

    .empty-inbox h3 {
      color: #2c3e50;
      margin-bottom: 0.75rem;
      font-size: 1.5rem;
    }

    .empty-inbox p {
      color: #7f8c8d;
      font-size: 1.05rem;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      gap: 1.25rem;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .notification-card:hover {
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .notification-card.unread {
      background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
      border-color: #fee;
    }

    .notification-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 600;
    }

    .notification-time {
      font-size: 0.85rem;
      color: #95a5a6;
      white-space: nowrap;
    }

    .notification-message {
      margin: 0 0 0.75rem;
      color: #5a6c7d;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .notification-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .order-badge {
      padding: 0.375rem 0.75rem;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .amount {
      padding: 0.375rem 0.75rem;
      background: #f1f8e9;
      color: #558b2f;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
      align-items: start;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: none;
      background: #ecf0f1;
      color: #7f8c8d;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-action:hover {
      background: #f44336;
      color: white;
      transform: scale(1.1);
    }

    .unread-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 10px;
      height: 10px;
      background: #e53935;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.2);
      }
    }

    @media (max-width: 768px) {
      .inbox-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .inbox-header h1 {
        font-size: 1.5rem;
      }

      .notification-card {
        padding: 1rem;
      }

      .notification-icon {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }

      .notification-header {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class BoiteReceptionComponent implements OnInit {
  notifications: InboxNotification[] = [];
  loading = true;

  constructor(
    private inboxService: InboxService,
    private toastService: ToastService,
    private confirmService: ConfirmDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.inboxService.getUserNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.toastService.error('Impossible de charger les notifications');
        this.loading = false;
      }
    });
  }

  handleNotificationClick(notification: InboxNotification): void {
    // Mark as read if unread
    if (!notification.isRead) {
      this.inboxService.markAsRead(notification.id).subscribe();
    }

    // Navigate to order details if it's an order notification
    if (notification.orderId) {
      this.router.navigate(['/details-commande', notification.orderId]);
    }
  }

  async markAllAsRead(): Promise<void> {
    this.inboxService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('Toutes les notifications ont été marquées comme lues');
      },
      error: () => {
        this.toastService.error('Erreur lors de la mise à jour');
      }
    });
  }

  async deleteNotification(notification: InboxNotification): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      'Voulez-vous supprimer cette notification ?',
      'Supprimer la notification'
    );

    if (!confirmed) return;

    this.inboxService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.toastService.success('Notification supprimée');
      },
      error: () => {
        this.toastService.error('Erreur lors de la suppression');
      }
    });
  }

  hasUnread(): boolean {
    return this.notifications.some(n => !n.isRead);
  }

  getIcon(type: string): string {
    return this.inboxService.getNotificationIcon(type);
  }

  getColor(type: string): string {
    return this.inboxService.getNotificationColor(type);
  }

  getTimeAgo(dateString: string): string {
    return this.inboxService.getTimeAgo(dateString);
  }
}
