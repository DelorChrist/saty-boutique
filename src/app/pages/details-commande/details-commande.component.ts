// src/app/pages/details-commande/details-commande.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-details-commande',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './details-commande.component.html',
  styleUrls: ['./details-commande.component.scss'],
})
export class DetailsCommandeComponent implements OnInit {
  order: Order | null = null;
  orderId: string | null = null;

  canCancel = false;
  canReturn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }

    this.route.paramMap.subscribe(params => {
      this.orderId = params.get('id');

      if (this.orderId) {
        this.loadOrder();
      } else {
        this.router.navigate(['/commandes']);
      }
    });
  }

  private loadOrder(): void {
    if (!this.orderId) return;

    this.order = this.ordersService.getOrderById(this.orderId);

    console.log('ORDER DETAILS = ', this.order);

    if (!this.order) {
      alert('Commande introuvable');
      this.router.navigate(['/commandes']);
      return;
    }

    this.canCancel = this.ordersService.canCancelOrder(this.order);
    this.canReturn = this.ordersService.canReturnOrder(this.order);
  }

  /* ========== ACTIONS ========== */

  onCancelOrder(): void {
    if (!this.order) return;

    const confirmed = confirm(
      `Voulez-vous vraiment annuler la commande #${this.order.id} ?\n\nCette action est irréversible.`,
    );

    if (!confirmed) return;

    const reason = prompt("Raison de l'annulation (optionnel) :");

    const success = this.ordersService.cancelOrder(
      this.order.id,
      reason || undefined,
    );

    if (success) {
      alert('Commande annulée avec succès');
      this.loadOrder();
    } else {
      alert("Impossible d'annuler cette commande");
    }
  }

  onRequestReturn(): void {
    if (!this.order) return;

    alert(
      'Demande de retour enregistrée !\n\nNotre équipe vous contactera sous 24h pour organiser le retour.',
    );
  }

  onContactSupport(): void {
    this.router.navigate(['/chat'], {
      queryParams: { order: this.order?.id },
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/details-produit', productId]);
  }

  goBackToOrders(): void {
    this.router.navigate(['/commandes']);
  }

  /* ========== UTILITAIRES ========== */

  getStatusLabel(status: OrderStatus): string {
    return this.ordersService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return this.ordersService.getStatusColor(status);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR');
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Paiement à la livraison',
      mobile_money: 'Mobile Money',
      card: 'Carte bancaire',
    };
    return labels[method] || method;
  }

  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      paid: 'Payé',
      failed: 'Échoué',
      refunded: 'Remboursé',
    };
    return labels[status] || status;
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

  getTimelineSteps(): {
    status: string;
    label: string;
    icon: string;
    date?: Date;
    completed: boolean;
    current: boolean;
  }[] {
    if (!this.order) return [];

    const steps = [
      {
        status: 'pending',
        label: 'Commande passée',
        icon: '📝',
        date: this.order.createdAt,
        completed: true,
        current: this.order.status === 'pending',
      },
      {
        status: 'confirmed',
        label: 'Confirmée',
        icon: '✓',
        date: this.order.confirmedAt,
        completed: !!this.order.confirmedAt,
        current: this.order.status === 'confirmed',
      },
      {
        status: 'processing',
        label: 'En préparation',
        icon: '📦',
        date: this.order.statusHistory.find(
          (h: { status: OrderStatus; date: Date }) =>
            h.status === 'processing',
        )?.date,
        completed: ['processing', 'shipped', 'delivered'].includes(
          this.order.status,
        ),
        current: this.order.status === 'processing',
      },
      {
        status: 'shipped',
        label: 'Expédiée',
        icon: '🚚',
        date: this.order.shippedAt,
        completed: !!this.order.shippedAt,
        current: this.order.status === 'shipped',
      },
      {
        status: 'delivered',
        label: 'Livrée',
        icon: '✓',
        date: this.order.deliveredAt,
        completed: !!this.order.deliveredAt,
        current: this.order.status === 'delivered',
      },
    ];

    if (this.order.status === 'cancelled') {
      return [
        {
          status: 'cancelled',
          label: 'Commande annulée',
          icon: '✕',
          date: this.order.cancelledAt,
          completed: true,
          current: true,
        },
      ];
    }

    return steps;
  }

  printInvoice(): void {
    window.print();
  }

  downloadInvoice(): void {
    alert('Téléchargement de la facture (fonctionnalité à venir)');
  }
}
