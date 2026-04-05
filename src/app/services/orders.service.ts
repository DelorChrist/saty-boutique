import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Order, OrderItem, OrderStatus } from '../models/order.model';
import { environment } from '../../environments/environment';

interface ApiOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  variant?: { size?: string | null; color?: string | null } | null;
  image?: string | null;
  product?: { images?: string[] } | null;
}

interface ApiOrder {
  id: string;
  userId: string;
  items: ApiOrderItem[];
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  totalAmount: number;
  shippingAddress: Order['shippingAddress'];
  customerNote?: string | null;
  internalNote?: string | null;
  status: OrderStatus;
  paymentMethod: Order['paymentMethod'];
  paymentStatus: Order['paymentStatus'];
  createdAt: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /* ========== GESTION DES COMMANDES ========== */

  createOrder(data: {
    items: OrderItem[];
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
    customerNote?: string;
    discount?: number;
    shippingCost?: number;
    promoCode?: string;
  }): Observable<Order> {
    const payload = {
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      discount: data.discount || 0,
      shippingCost: data.shippingCost || 0,
      customerNote: data.customerNote,
      promoCode: data.promoCode,
    };

    return this.http.post<ApiOrder>(this.apiUrl, payload).pipe(
      map(order => this.mapOrderFromApi(order))
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<{ orders: ApiOrder[] }>(this.apiUrl).pipe(
      map(response => response.orders.map(order => this.mapOrderFromApi(order)))
    );
  }

  getAllOrders(): Observable<Order[]> {
    return this.getMyOrders();
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<ApiOrder>(`${this.apiUrl}/${orderId}`).pipe(
      map(order => this.mapOrderFromApi(order))
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.put<ApiOrder>(`${this.apiUrl}/${orderId}/status`, { status }).pipe(
      map(order => this.mapOrderFromApi(order))
    );
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.put<ApiOrder>(`${this.apiUrl}/${orderId}/cancel`, {}).pipe(
      map(order => this.mapOrderFromApi(order))
    );
  }

  /* ========== UTILITAIRES FRONT ========== */

  searchOrders(orders: Order[], query: string): Order[] {
    const searchTerm = query.toLowerCase();
    return orders.filter(order => {
      if (order.id.toLowerCase().includes(searchTerm)) return true;
      return order.items.some(item => item.name.toLowerCase().includes(searchTerm));
    });
  }

  getUserStats(orders: Order[]) {
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.totalFcfa, 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      averageOrderValue: orders.length
        ? orders.reduce((sum, o) => sum + o.totalFcfa, 0) / orders.length
        : 0,
    };
  }

  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed', 'processing'].includes(order.status);
  }

  canReturnOrder(order: Order): boolean {
    if (order.status !== 'delivered') return false;
    if (!order.deliveredAt) return false;

    const daysSinceDelivery = Math.floor(
      (new Date().getTime() - new Date(order.deliveredAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return daysSinceDelivery <= 7;
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      confirmed: 'Confirmee',
      processing: 'En preparation',
      shipped: 'Expediee',
      delivered: 'Livree',
      cancelled: 'Annulee',
      refunded: 'Remboursee',
    };
    return labels[status] || status;
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: 'orange',
      confirmed: 'blue',
      processing: 'purple',
      shipped: 'indigo',
      delivered: 'green',
      cancelled: 'red',
      refunded: 'gray',
    };
    return colors[status] || 'gray';
  }

  private mapOrderFromApi(order: ApiOrder): Order {
    const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const shippingCost = order.shippingCost ?? 0;
    const discount = order.discount ?? 0;
    const totalFcfa = order.totalAmount ?? subtotal + shippingCost - discount;

    return {
      id: order.id,
      userId: order.userId,
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        size: item.variant?.size ?? null,
        color: item.variant?.color ?? null,
        image: item.image || item.product?.images?.[0] || '',
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      shippingCost,
      discount,
      totalFcfa,
      shippingAddress: order.shippingAddress,
      customerNote: order.customerNote || undefined,
      internalNote: order.internalNote || undefined,
      status: order.status,
      createdAt: new Date(order.createdAt),
      confirmedAt: order.confirmedAt ? new Date(order.confirmedAt) : undefined,
      processingAt: order.processingAt ? new Date(order.processingAt) : undefined,
      shippedAt: order.shippedAt ? new Date(order.shippedAt) : undefined,
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
      cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      statusHistory: this.buildStatusHistory(order),
      user: order.user,
    };
  }

  private buildStatusHistory(order: ApiOrder): { status: OrderStatus; date: Date; note?: string }[] {
    const history: { status: OrderStatus; date: Date; note?: string }[] = [];
    if (order.createdAt) {
      history.push({ status: 'pending', date: new Date(order.createdAt), note: 'Commande creee' });
    }
    if (order.confirmedAt) {
      history.push({ status: 'confirmed', date: new Date(order.confirmedAt) });
    }
    if (order.processingAt) {
      history.push({ status: 'processing', date: new Date(order.processingAt) });
    }
    if (order.shippedAt) {
      history.push({ status: 'shipped', date: new Date(order.shippedAt) });
    }
    if (order.deliveredAt) {
      history.push({ status: 'delivered', date: new Date(order.deliveredAt) });
    }
    if (order.cancelledAt) {
      history.push({ status: 'cancelled', date: new Date(order.cancelledAt) });
    }
    return history;
  }
}