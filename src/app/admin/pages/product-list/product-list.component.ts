import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminProductService, Product } from '../../services/admin-product.service';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
    products$: Observable<Product[]>;

    constructor(
        private productService: AdminProductService,
        private toastService: ToastService,
        private confirmService: ConfirmDialogService
    ) {
        this.products$ = this.productService.getAllProducts();
    }

    ngOnInit(): void { }

    getImageUrl(imagePath: string): string {
        if (!imagePath) return 'assets/placeholder.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${environment.apiUrl.replace('/api', '')}${imagePath}`;
    }

    async toggleStatus(product: Product): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            `Voulez-vous ${product.isActive ? 'désactiver' : 'activer'} ce produit ?`,
            product.isActive ? 'Désactiver le produit' : 'Activer le produit',
            { confirmText: product.isActive ? 'Désactiver' : 'Activer', type: 'warning' }
        );

        if (!confirmed) return;

        this.productService.toggleProductStatus(product).subscribe(() => {
            this.products$ = this.productService.getAllProducts();
            this.toastService.success(`Produit ${product.isActive ? 'désactivé' : 'activé'} avec succès`);
        });
    }

    async deleteProduct(product: Product): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Êtes-vous sûr de vouloir supprimer ce produit ?',
            'Supprimer le produit',
            { confirmText: 'Supprimer', type: 'danger' }
        );

        if (!confirmed) return;

        this.productService.deleteProduct(product.id).subscribe(() => {
            this.products$ = this.productService.getAllProducts();
            this.toastService.success('Produit supprimé avec succès');
        });
    }
}
