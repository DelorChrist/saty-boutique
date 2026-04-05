import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { PromoService } from '../../services/promo.service';
import { Order, OrderItem } from '../../models/order.model';
import { environment } from '../../../environments/environment';

interface DeliveryInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  commune: string;
  city: string;
  additionalInfo: string;
}

type PaymentMethod =
  | 'orange-money'
  | 'mtn-money'
  | 'moov-money'
  | 'wave'
  | 'card'
  | 'cash';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];

  deliveryInfo: DeliveryInfo = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    commune: '',
    city: 'Abidjan',
    additionalInfo: '',
  };

  communes = [
    'Abobo',
    'Adjamé',
    'Attécoubé',
    'Cocody',
    'Koumassi',
    'Marcory',
    'Plateau',
    'Port-Bouët',
    'Treichville',
    'Yopougon',
    'Bingerville',
    'Songon',
  ];

  selectedPaymentMethod: PaymentMethod | null = null;
  isSubmitting = false;

  // contrôle de l’ouverture de la section paiement
  showPaymentSection = false;
  // Code promo
  promoCode = '';
  appliedPromo: any = null;
  isValidatingPromo = false;
  promoError = '';
  constructor(
    public cartService: CartService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private promoService: PromoService
  ) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      if (items.length === 0) {
        this.router.navigate(['/panier']);
      }
    });

    // Pré-remplir depuis une adresse sélectionnée (si disponible)
    const savedAddress = localStorage.getItem('saty_selected_address');
    if (savedAddress) {
      try {
        const addr = JSON.parse(savedAddress);

        this.deliveryInfo.firstName = addr.fullName
          ? addr.fullName.split(' ')[0]
          : '';
        this.deliveryInfo.lastName = addr.fullName
          ? addr.fullName.split(' ').slice(1).join(' ')
          : '';
        this.deliveryInfo.phone = addr.phone || '';
        this.deliveryInfo.address = addr.address || '';
        this.deliveryInfo.commune = addr.commune || '';
        this.deliveryInfo.city = addr.city || 'Abidjan';
      } catch {
      }
    }
  }

  goToAddresses(): void {
    this.router.navigate(['/mes-adresses'], {
      queryParams: { redirect: '/checkout' },
    });
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  calculateDeliveryFee(): number {
    const fees: { [key: string]: number } = {
      Cocody: 1500,
      Plateau: 2000,
      Marcory: 1500,
      Yopougon: 2000,
      Abobo: 2500,
      Adjamé: 1500,
      Attécoubé: 2000,
      Koumassi: 1500,
      'Port-Bouët': 2000,
      Treichville: 1500,
      Bingerville: 2500,
      Songon: 3000,
    };

    return fees[this.deliveryInfo.commune] || 2000;
  }

  get subtotal(): number {
    return this.cartService.getTotalPrice();
  }

  get shippingCost(): number {
    return this.deliveryInfo.commune ? this.calculateDeliveryFee() : 0;
  }

  get discount(): number {
    if (!this.appliedPromo) return 0;
    
    const subtotalAmount = this.subtotal;
    
    if (this.appliedPromo.type === 'percentage') {
      return Math.round((subtotalAmount * this.appliedPromo.discount) / 100);
    }
    return this.appliedPromo.discount;
  }

  get total(): number {
    return Math.max(0, this.subtotal + this.shippingCost - this.discount);
  }

  // validation uniquement de la partie "livraison"
  isDeliveryValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+225)?[0-9]{10}$/;

    return !!(
      this.deliveryInfo.firstName.trim() &&
      this.deliveryInfo.lastName.trim() &&
      emailRegex.test(this.deliveryInfo.email) &&
      phoneRegex.test(this.deliveryInfo.phone.replace(/\s/g, '')) &&
      this.deliveryInfo.address.trim() &&
      this.deliveryInfo.commune
    );
  }

  // validation globale pour activer "Valider la commande"
  isFormValid(): boolean {
    return this.isDeliveryValid() && !!this.selectedPaymentMethod;
  }

  openPaymentSection(): void {
    if (!this.isDeliveryValid()) {
      this.toastService.warning('Veuillez compléter les informations de livraison avant de continuer.');
      return;
    }
    this.showPaymentSection = true;
  }

  applyPromoCode(): void {
    if (!this.promoCode.trim()) {
      this.promoError = 'Veuillez entrer un code promo';
      return;
    }

    this.isValidatingPromo = true;
    this.promoError = '';

    this.promoService.validatePromoCode(this.promoCode.trim(), this.subtotal).subscribe({
      next: (promo) => {
        this.isValidatingPromo = false;
        this.appliedPromo = promo;
        this.toastService.success(`Code promo "${this.promoCode}" appliqué ! Réduction de ${this.promoService.getDiscountText(promo)}`);
        this.promoError = '';
      },
      error: (err) => {
        this.isValidatingPromo = false;
        this.promoError = err.error?.message || 'Code promo invalide';
        this.appliedPromo = null;
      }
    });
  }

  removePromo(): void {
    this.appliedPromo = null;
    this.promoCode = '';
    this.promoError = '';
    this.toastService.info('Code promo retiré');
  }

  private buildOrderItems(): OrderItem[] {
    return this.items.map(item => ({
      productId: String(item.productId),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: (item as any).size ?? null,
      color: (item as any).color ?? null,
      image: (item as any).image ?? '',
      subtotal: item.price * item.quantity,
    }));
  }

  async submitOrder(): Promise<void> {
    if (!this.isFormValid()) {
      this.toastService.warning('Veuillez remplir tous les champs obligatoires correctement');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/checkout' },
      });
      return;
    }

    this.isSubmitting = true;
    const items = this.buildOrderItems();

    this.ordersService.createOrder({
      items,
      shippingAddress: {
        fullName: `${this.deliveryInfo.firstName} ${this.deliveryInfo.lastName}`,
        phone: this.deliveryInfo.phone,
        address: this.deliveryInfo.address,
        city: this.deliveryInfo.city,
        district: this.deliveryInfo.commune,
      },
      paymentMethod: this.selectedPaymentMethod === 'cash' ? 'cash' : 'mobile_money',
      customerNote: this.deliveryInfo.additionalInfo || undefined,
      discount: this.discount,
      shippingCost: this.shippingCost,
      promoCode: this.appliedPromo?.code || undefined,
    }).subscribe({
      next: (order: Order) => {
        this.cartService.clearCart();
        this.isSubmitting = false;
        this.toastService.success(
          `Commande ${order.id} validée ! Vous allez recevoir un email de confirmation à ${this.deliveryInfo.email}`,
          7000
        );
        this.router.navigate(['/commandes']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Erreur lors de la creation de la commande');
      }
    });
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.mediaUrl}${imagePath}`;
  }
}
