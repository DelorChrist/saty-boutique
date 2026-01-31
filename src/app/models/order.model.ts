// src/app/models/order.model.ts

export type OrderStatus =
  | 'pending' // En attente de confirmation
  | 'confirmed' // Confirmée
  | 'processing' // En préparation
  | 'shipped' // Expédiée
  | 'delivered' // Livrée
  | 'cancelled' // Annulée
  | 'refunded'; // Remboursée

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  image: string;
  subtotal: number; // price * quantity
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];

  // Prix
  subtotal: number; // Total articles
  shippingCost: number;
  discount: number;
  totalFcfa: number; // Total final

  // Livraison
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };

  // Dates & Statut
  status: OrderStatus;
  createdAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;

  // Suivi
  trackingNumber?: string;
  estimatedDelivery?: Date;

  // Paiement
  paymentMethod: 'cash' | 'mobile_money' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Notes
  customerNote?: string;
  internalNote?: string; 

  // Historique des changements de statut
  statusHistory: {
    status: OrderStatus;
    date: Date;
    note?: string;
  }[];
}
