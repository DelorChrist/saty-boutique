import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InboxNotification {
  id: string;
  userId: string;
  orderId?: string;
  type: 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'promo' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InboxService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private notificationsSubject = new BehaviorSubject<InboxNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Start polling for unread count (call after login)
   */
  startPolling(): void {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.getUnreadCount())
      )
      .subscribe();
  }

  /**
   * Get all user notifications
   */
  getUserNotifications(): Observable<InboxNotification[]> {
    return this.http.get<InboxNotification[]>(this.apiUrl).pipe(
      tap(notifications => this.notificationsSubject.next(notifications))
    );
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`).pipe(
      tap(response => this.unreadCountSubject.next(response.count))
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<InboxNotification> {
    return this.http.put<InboxNotification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
        
        // Update local notifications list
        const notifications = this.notificationsSubject.value.map(n => 
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        );
        this.notificationsSubject.next(notifications);
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
        const notifications = this.notificationsSubject.value.map(n => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString()
        }));
        this.notificationsSubject.next(notifications);
      })
    );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        const deletedNotification = this.notificationsSubject.value.find(n => n.id === notificationId);
        const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(notifications);
        
        if (deletedNotification && !deletedNotification.isRead) {
          const currentCount = this.unreadCountSubject.value;
          if (currentCount > 0) {
            this.unreadCountSubject.next(currentCount - 1);
          }
        }
      })
    );
  }

  /**
   * Reset (call on logout)
   */
  reset(): void {
    this.unreadCountSubject.next(0);
    this.notificationsSubject.next([]);
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'order_confirmed': '✅',
      'order_shipped': '🚚',
      'order_delivered': '🎉',
      'order_cancelled': '❌',
      'promo': '🎁',
      'system': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  /**
   * Get notification color based on type
   */
  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      'order_confirmed': '#4caf50',
      'order_shipped': '#2196f3',
      'order_delivered': '#ff9800',
      'order_cancelled': '#f44336',
      'promo': '#9c27b0',
      'system': '#607d8b'
    };
    return colors[type] || '#607d8b';
  }

  /**
   * Format time ago
   */
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
