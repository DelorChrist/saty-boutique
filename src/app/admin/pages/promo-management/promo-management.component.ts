import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminProductService } from '../../services/admin-product.service';

@Component({
    selector: 'app-promo-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './promo-management.component.html',
    styleUrls: ['./promo-management.component.scss']
})
export class PromoManagementComponent implements OnInit {
    promos: any[] = [];
    promoForm: FormGroup;
    isEditMode = false;
    editingPromoId: string | null = null;
    loading = false;
    submitting = false;
    statusMessage: string | null = null;
    statusType: 'success' | 'error' = 'success';

    constructor(
        private fb: FormBuilder,
        private productService: AdminProductService
    ) {
        this.promoForm = this.fb.group({
            code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/)]],
            discount: [0, [Validators.required, Validators.min(1)]],
            type: ['percentage', Validators.required],
            expiryDate: [''],
            minOrderAmount: [0],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.loadPromos();
    }

    loadPromos(): void {
        this.loading = true;
        this.productService.getAllPromos().subscribe({
            next: (data) => {
                this.promos = data;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.promoForm.invalid) return;

        this.submitting = true;
        const formValue = this.promoForm.value;

        if (this.isEditMode && this.editingPromoId) {
            this.productService.updatePromo(this.editingPromoId, formValue).subscribe({
                next: () => {
                    this.statusMessage = 'Code promo mis à jour !';
                    this.statusType = 'success';
                    this.resetForm();
                    this.loadPromos();
                },
                error: (err) => {
                    this.statusMessage = 'Erreur lors de la mise à jour';
                    this.statusType = 'error';
                    this.submitting = false;
                }
            });
        } else {
            this.productService.createPromo(formValue).subscribe({
                next: () => {
                    this.statusMessage = 'Code promo créé !';
                    this.statusType = 'success';
                    this.resetForm();
                    this.loadPromos();
                },
                error: (err) => {
                    this.statusMessage = 'Erreur lors de la création';
                    this.statusType = 'error';
                    this.submitting = false;
                }
            });
        }
    }

    editPromo(promo: any): void {
        this.isEditMode = true;
        this.editingPromoId = promo.id;

        // Format date for input type="date"
        let expiry = '';
        if (promo.expiryDate) {
            expiry = new Date(promo.expiryDate).toISOString().split('T')[0];
        }

        this.promoForm.patchValue({
            code: promo.code,
            discount: promo.discount,
            type: promo.type,
            expiryDate: expiry,
            minOrderAmount: promo.minOrderAmount,
            isActive: promo.isActive
        });
        this.statusMessage = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deletePromo(id: string): void {
        if (!confirm('Voulez-vous supprimer ce code promo ?')) return;

        this.productService.deletePromo(id).subscribe({
            next: () => {
                this.statusMessage = 'Code promo supprimé !';
                this.statusType = 'success';
                this.loadPromos();
            },
            error: (err) => {
                this.statusMessage = 'Erreur lors de la suppression';
                this.statusType = 'error';
            }
        });
    }

    resetForm(): void {
        this.isEditMode = false;
        this.editingPromoId = null;
        this.promoForm.reset({
            type: 'percentage',
            isActive: true,
            minOrderAmount: 0,
            discount: 0
        });
        this.submitting = false;
        setTimeout(() => this.statusMessage = null, 3000);
    }

    isExpired(expiryDate: string): boolean {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return expiry < now;
    }
}
