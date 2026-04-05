import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoService, PromoCode } from '../../services/promo.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-bons-achats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bons-achats-container">
      <div class="page-header">
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          Mes Bons d'Achats
        </h1>
        <p>Profitez de nos codes promo exclusifs pour économiser sur vos achats !</p>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement des codes promo...</p>
      </div>

      <div class="no-promos" *ngIf="!loading && promos.length === 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <h3>Aucun code promo disponible</h3>
        <p>Revenez bientôt pour découvrir nos nouvelles offres exclusives !</p>
      </div>

      <div class="promos-grid" *ngIf="!loading && promos.length > 0">
        <div *ngFor="let promo of promos" class="promo-card" [class.expiring-soon]="isExpiringSoon(promo)">
          <div class="promo-header">
            <div class="promo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"></polyline>
                <rect x="2" y="7" width="20" height="5"></rect>
                <line x1="12" y1="22" x2="12" y2="7"></line>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
              </svg>
            </div>
            <div class="promo-discount">
              {{ getDiscountText(promo) }}
            </div>
          </div>

          <div class="promo-body">
            <div class="promo-code-section">
              <label>Code Promo</label>
              <div class="code-wrapper">
                <input 
                  type="text" 
                  [value]="promo.code" 
                  readonly
                  [id]="'code-' + promo.id"
                >
                <button 
                  class="copy-btn" 
                  (click)="copyCode(promo.code)"
                  title="Copier le code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="promo-details">
              <div class="detail-item" *ngIf="promo.minOrderAmount > 0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Minimum : {{ promo.minOrderAmount }} FCFA
              </div>

              <div class="detail-item" *ngIf="promo.expiryDate">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Expire le : {{ formatExpiryDate(promo.expiryDate) }}
              </div>
            </div>
          </div>

          <div class="promo-footer">
            <span class="badge" *ngIf="isExpiringSoon(promo)">
               Expire bientôt
            </span>
            <span class="badge valid" *ngIf="!promo.expiryDate">
              ✓ Sans expiration
            </span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>Comment utiliser vos codes promo ?</h3>
        <ol>
          <li>Copiez le code promo de votre choix</li>
          <li>Ajoutez vos articles au panier</li>
          <li>Au moment du paiement, collez le code dans le champ prévu</li>
          <li>La réduction sera appliquée automatiquement</li>
        </ol>
      </div>
    </div>
  `,
  styles: [`
    .bons-achats-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .page-header h1 svg {
      color: #e53935;
    }

    .page-header p {
      color: #7f8c8d;
      font-size: 1.1rem;
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

    .no-promos {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 20px;
      margin: 2rem 0;
    }

    .no-promos svg {
      color: #95a5a6;
      margin-bottom: 1.5rem;
    }

    .no-promos h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .no-promos p {
      color: #7f8c8d;
    }

    .promos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .promo-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .promo-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(229, 57, 53, 0.15);
      border-color: #e53935;
    }

    .promo-card.expiring-soon {
      background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
    }

    .promo-header {
      background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
      color: white;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .promo-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .promo-icon {
      text-align: center;
      margin-bottom: 1rem;
    }

    .promo-icon svg {
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.2));
    }

    .promo-discount {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 800;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      letter-spacing: -1px;
    }

    .promo-body {
      padding: 1.5rem;
    }

    .promo-code-section {
      margin-bottom: 1.5rem;
    }

    .promo-code-section label {
      display: block;
      font-size: 0.85rem;
      color: #7f8c8d;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .code-wrapper {
      display: flex;
      gap: 0.5rem;
    }

    .code-wrapper input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 2px dashed #e53935;
      border-radius: 10px;
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 700;
      color: #e53935;
      background: #fff5f5;
      text-align: center;
      letter-spacing: 2px;
    }

    .copy-btn {
      padding: 0.75rem 1rem;
      background: #e53935;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .copy-btn:hover {
      background: #c62828;
      transform: scale(1.05);
    }

    .copy-btn:active {
      transform: scale(0.95);
    }

    .promo-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #5a6c7d;
    }

    .detail-item svg {
      color: #e53935;
      flex-shrink: 0;
    }

    .promo-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      display: flex;
      justify-content: center;
    }

    .badge {
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #ffeaa7;
      color: #d63031;
    }

    .badge.valid {
      background: #d4edda;
      color: #155724;
    }

    .info-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 20px;
      margin-top: 3rem;
    }

    .info-section h3 {
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .info-section ol {
      padding-left: 1.5rem;
      line-height: 2;
    }

    .info-section ol li {
      margin-bottom: 0.5rem;
      font-size: 1.05rem;
    }

    @media (max-width: 768px) {
      .page-header h1 {
        font-size: 1.8rem;
      }

      .promos-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .promo-discount {
        font-size: 2rem;
      }
    }
  `]
})
export class BonsAchatsComponent implements OnInit {
  promos: PromoCode[] = [];
  loading = true;

  constructor(
    private promoService: PromoService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPromos();
  }

  loadPromos(): void {
    this.loading = true;
    this.promoService.getActivePromoCodes().subscribe({
      next: (data) => {
        this.promos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement codes promo:', err);
        this.toastService.error('Impossible de charger les codes promo');
        this.loading = false;
      }
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success(`Code "${code}" copié !`);
    }).catch(() => {
      this.toastService.error('Impossible de copier le code');
    });
  }

  getDiscountText(promo: PromoCode): string {
    return this.promoService.getDiscountText(promo);
  }

  formatExpiryDate(expiryDate: string): string {
    return this.promoService.formatExpiryDate(expiryDate);
  }

  isExpiringSoon(promo: PromoCode): boolean {
    if (!promo.expiryDate) return false;
    const expiryDate = new Date(promo.expiryDate);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return expiryDate <= threeDaysFromNow && expiryDate > new Date();
  }
}
