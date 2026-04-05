import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoService, PromoCode } from '../../services/promo.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promo-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="promo-overlay" *ngIf="isVisible" [@fadeIn] (click)="close()">
      <div class="promo-popup" (click)="$event.stopPropagation()" [@slideUp]>
        <button class="close-btn" (click)="close()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="popup-header">
          <div class="gift-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"></polyline>
              <rect x="2" y="7" width="20" height="5"></rect>
              <line x1="12" y1="22" x2="12" y2="7"></line>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
            </svg>
          </div>
          <h2>🎉 Codes Promo Exclusifs ! 🎉</h2>
          <p>Profitez de nos offres spéciales</p>
        </div>

        <div class="popup-body">
          <div class="loading" *ngIf="loading">
            <div class="spinner"></div>
          </div>

          <div class="promo-list" *ngIf="!loading && promos.length > 0">
            <div *ngFor="let promo of promos" class="promo-item">
              <div class="promo-badge">
                <span class="discount">{{ getDiscountText(promo) }}</span>
                <span class="type">{{ promo.type === 'percentage' ? 'RÉDUCTION' : 'BONUS' }}</span>
              </div>
              
              <div class="promo-info">
                <div class="code-section">
                  <span class="label">Code :</span>
                  <span class="code">{{ promo.code }}</span>
                  <button class="copy-btn" (click)="copyCode(promo.code)" title="Copier">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                
                <div class="details">
                  <span *ngIf="promo.minOrderAmount > 0" class="detail">
                    Min. {{ promo.minOrderAmount }} FCFA
                  </span>
                  <span *ngIf="promo.expiryDate" class="detail expiry">
                    Expire : {{ formatShortDate(promo.expiryDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="no-promos" *ngIf="!loading && promos.length === 0">
            <p>Aucun code promo disponible pour le moment</p>
          </div>
        </div>

        <div class="popup-footer">
          <button class="btn-view-all" (click)="viewAllPromos()">
            Voir tous les codes promo
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .promo-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 1rem;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .promo-popup {
      background: white;
      border-radius: 24px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes slideUp {
      from {
        transform: translateY(100px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
    }

    .close-btn:hover {
      background: white;
      transform: rotate(90deg);
    }

    .popup-header {
      background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
      color: white;
      padding: 2.5rem 2rem 2rem;
      text-align: center;
      border-radius: 24px 24px 0 0;
      position: relative;
      overflow: hidden;
    }

    .popup-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.3;
    }

    .gift-icon {
      margin-bottom: 1rem;
      animation: bounce 1s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .gift-icon svg {
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    }

    .popup-header h2 {
      margin: 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 800;
      position: relative;
    }

    .popup-header p {
      margin: 0;
      opacity: 0.95;
      font-size: 1.05rem;
    }

    .popup-body {
      padding: 1.5rem;
      min-height: 200px;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #e53935;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .promo-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .promo-item {
      background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
      border-radius: 16px;
      padding: 1.25rem;
      border: 2px solid #fee;
      transition: all 0.3s ease;
      display: flex;
      gap: 1rem;
    }

    .promo-item:hover {
      border-color: #e53935;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(229, 57, 53, 0.15);
    }

    .promo-badge {
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
    }

    .promo-badge .discount {
      font-size: 1.4rem;
      font-weight: 800;
      line-height: 1;
    }

    .promo-badge .type {
      font-size: 0.65rem;
      margin-top: 0.25rem;
      opacity: 0.9;
      letter-spacing: 0.5px;
    }

    .promo-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .code-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .code-section .label {
      color: #7f8c8d;
      font-size: 0.85rem;
    }

    .code-section .code {
      font-family: 'Courier New', monospace;
      font-weight: 700;
      color: #e53935;
      font-size: 1.1rem;
      letter-spacing: 1px;
      padding: 0.25rem 0.75rem;
      background: white;
      border-radius: 6px;
      border: 1px dashed #e53935;
    }

    .copy-btn {
      background: #e53935;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.4rem 0.6rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .copy-btn:hover {
      background: #c62828;
      transform: scale(1.1);
    }

    .copy-btn:active {
      transform: scale(0.95);
    }

    .details {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.85rem;
    }

    .detail {
      color: #5a6c7d;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .detail.expiry {
      color: #e67e22;
      font-weight: 600;
    }

    .no-promos {
      text-align: center;
      padding: 2rem;
      color: #7f8c8d;
    }

    .popup-footer {
      padding: 1.5rem;
      border-top: 1px solid #ecf0f1;
      display: flex;
      justify-content: center;
    }

    .btn-view-all {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0.875rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-view-all:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-view-all:active {
      transform: translateY(0);
    }

    @media (max-width: 576px) {
      .promo-popup {
        max-width: 100%;
        margin: 0;
        border-radius: 16px;
      }

      .popup-header h2 {
        font-size: 1.5rem;
      }

      .promo-item {
        flex-direction: column;
      }

      .promo-badge {
        width: 100%;
        height: 60px;
        flex-direction: row;
        gap: 0.5rem;
      }
    }
  `],
  animations: []
})
export class PromoPopupComponent implements OnInit, OnDestroy {
  isVisible = false;
  promos: PromoCode[] = [];
  loading = true;

  constructor(
    private promoService: PromoService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to popup trigger (only triggered on login, not when viewing bons-achats)
    this.promoService.popupTrigger$.subscribe(promos => {
      if (promos.length > 0) {
        this.promos = promos;
        this.loading = false;
        // Reset visibility before showing
        this.isVisible = false;
        this.show();
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  show(): void {
    setTimeout(() => {
      this.isVisible = true;
    }, 300); // Show after 300ms
  }

  close(): void {
    this.isVisible = false;
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success(`Code "${code}" copié !`);
    });
  }

  getDiscountText(promo: PromoCode): string {
    return this.promoService.getDiscountText(promo);
  }

  formatShortDate(expiryDate: string): string {
    const date = new Date(expiryDate);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  viewAllPromos(): void {
    this.close();
    this.router.navigate(['/bons-achats']);
  }
}
