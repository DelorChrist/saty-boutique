// src/app/services/orders.service.ts

import { Injectable } from '@angular/core';
import { Order, OrderItem, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly STORAGE_KEY = 'saty_orders';

  constructor() {
    this.initializeMockOrders();
  }

  /* ========== GESTION DES COMMANDES ========== */

  createOrder(data: {
    items: OrderItem[];
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
    customerNote?: string;
    discount?: number;
  }): Order {
    const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = this.calculateShippingCost(data.shippingAddress.city);
    const discount = data.discount || 0;
    const totalFcfa = subtotal + shippingCost - discount;

    const createdAt = new Date();
    const estimatedDelivery = this.calculateEstimatedDelivery(createdAt);

    const order: Order = {
      id: this.generateOrderId(),
      userId: this.getCurrentUserId(),
      items: data.items,
      subtotal,
      shippingCost,
      discount,
      totalFcfa,
      shippingAddress: data.shippingAddress,
      status: 'pending',
      createdAt,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      customerNote: data.customerNote,
      estimatedDelivery,
      statusHistory: [
        {
          status: 'pending',
          date: createdAt,
          note: 'Commande créée',
        },
      ],
    };

    this.saveOrder(order);
    return order;
  }

  addOrder(order: Order): void {
    this.saveOrder(order);
  }

  getMyOrders(): Order[] {
    const orders = this.getAllOrders();
    const userId = this.getCurrentUserId();
    return orders
      .filter(o => o.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  getOrderById(orderId: string): Order | null {
    const orders = this.getAllOrders();
    const order = orders.find(o => o.id === orderId);

    if (!order) return null;

    if (order.userId !== this.getCurrentUserId()) {
      console.warn("Tentative d'accès à une commande non autorisée");
      return null;
    }

    return order;
  }

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
  ): boolean {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) return false;

    const order = orders[orderIndex];

    order.status = newStatus;

    const now = new Date();
    if (newStatus === 'confirmed') order.confirmedAt = now;
    if (newStatus === 'shipped') order.shippedAt = now;
    if (newStatus === 'delivered') {
      order.deliveredAt = now;
      order.paymentStatus = 'paid';
    }
    if (newStatus === 'cancelled') order.cancelledAt = now;
    if (newStatus === 'refunded') order.paymentStatus = 'refunded';

    order.statusHistory.push({
      status: newStatus,
      date: now,
      note,
    });

    orders[orderIndex] = order;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));

    return true;
  }

  cancelOrder(orderId: string, reason?: string): boolean {
    const order = this.getOrderById(orderId);

    if (!order) return false;

    if (!this.canCancelOrder(order)) {
      console.warn('Cette commande ne peut pas être annulée');
      return false;
    }

    return this.updateOrderStatus(
      orderId,
      'cancelled',
      reason || 'Annulée par le client',
    );
  }

  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed', 'processing'].includes(order.status);
  }

  canReturnOrder(order: Order): boolean {
    if (order.status !== 'delivered') return false;
    if (!order.deliveredAt) return false;

    const daysSinceDelivery = Math.floor(
      (new Date().getTime() -
        new Date(order.deliveredAt).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return daysSinceDelivery <= 7;
  }

  /* ========== FILTRES & RECHERCHE ========== */

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.getMyOrders().filter(o => o.status === status);
  }

  getOrdersByDateRange(startDate: Date, endDate: Date): Order[] {
    return this.getMyOrders().filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  searchOrders(query: string): Order[] {
    const searchTerm = query.toLowerCase();

    return this.getMyOrders().filter(order => {
      if (order.id.toLowerCase().includes(searchTerm)) return true;

      const hasProduct = order.items.some(item =>
        item.name.toLowerCase().includes(searchTerm),
      );
      if (hasProduct) return true;

      return false;
    });
  }

  /* ========== STATISTIQUES ========== */

  getUserStats() {
    const orders = this.getMyOrders();

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

  /* ========== UTILITAIRES ========== */

  generateId(): string {
    const prefix = 'SB';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private generateOrderId(): string {
    return this.generateId();
  }

  private calculateShippingCost(city: string): number {
    const lowerCity = city.toLowerCase();

    if (lowerCity.includes('abidjan')) return 1000;
    if (lowerCity.includes('bouaké')) return 2000;
    if (lowerCity.includes('yamoussoukro')) return 1500;
    if (lowerCity.includes('san-pedro')) return 2500;

    return 3000;
  }

  /** Date de livraison estimée = date de commande + 3 jours */
  private calculateEstimatedDelivery(from: Date): Date {
    const date = new Date(from.getTime());
    date.setDate(date.getDate() + 3);
    return date;
  }

  private getCurrentUserId(): string {
    const currentUser = localStorage.getItem('saty_current_user');
    if (!currentUser) return 'guest';

    try {
      const user = JSON.parse(currentUser);
      return user.id || user.email;
    } catch {
      return 'guest';
    }
  }

  private saveOrder(order: Order): void {
    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
  }

  private getAllOrders(): Order[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      const orders = JSON.parse(stored);
      return orders.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        confirmedAt: o.confirmedAt ? new Date(o.confirmedAt) : undefined,
        shippedAt: o.shippedAt ? new Date(o.shippedAt) : undefined,
        deliveredAt: o.deliveredAt ? new Date(o.deliveredAt) : undefined,
        cancelledAt: o.cancelledAt ? new Date(o.cancelledAt) : undefined,
        estimatedDelivery: o.estimatedDelivery
          ? new Date(o.estimatedDelivery)
          : undefined,
        statusHistory: o.statusHistory.map((h: any) => ({
          ...h,
          date: new Date(h.date),
        })),
      }));
    } catch {
      return [];
    }
  }

  /** Plus de commandes de démo : on laisse vide */
  private initializeMockOrders(): void {
    // Intentionnellement vide pour ne plus injecter de commandes fictives
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
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
}
