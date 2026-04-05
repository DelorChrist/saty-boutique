import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of activeNotifications"
        class="notification notification-{{ notification.type }}"
        [@slideIn]
      >
        <div class="notification-icon">
          <span *ngIf="notification.type === 'success'">✓</span>
          <span *ngIf="notification.type === 'error'">✕</span>
          <span *ngIf="notification.type === 'warning'">⚠</span>
          <span *ngIf="notification.type === 'info'">ℹ</span>
        </div>
        <div class="notification-message">{{ notification.message }}</div>
        <button class="notification-close" (click)="removeNotification(notification.id)">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      border-left-color: #10b981;
    }

    .notification-error {
      border-left-color: #ef4444;
    }

    .notification-warning {
      border-left-color: #f59e0b;
    }

    .notification-info {
      border-left-color: #3b82f6;
    }

    .notification-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: bold;
      font-size: 14px;
    }

    .notification-success .notification-icon {
      background: #d1fae5;
      color: #10b981;
    }

    .notification-error .notification-icon {
      background: #fee2e2;
      color: #ef4444;
    }

    .notification-warning .notification-icon {
      background: #fef3c7;
      color: #f59e0b;
    }

    .notification-info .notification-icon {
      background: #dbeafe;
      color: #3b82f6;
    }

    .notification-message {
      flex: 1;
      font-size: 14px;
      color: #374151;
      line-height: 1.5;
    }

    .notification-close {
      background: transparent;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .notification-close:hover {
      color: #374151;
    }

    @media (max-width: 768px) {
      .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  activeNotifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notification => {
      this.activeNotifications.push(notification);

      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.duration);
      }
    });
  }

  removeNotification(id: number): void {
    this.activeNotifications = this.activeNotifications.filter(n => n.id !== id);
  }
}
