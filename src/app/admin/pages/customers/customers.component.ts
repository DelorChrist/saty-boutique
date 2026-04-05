import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './customers.component.html',
    styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
    customers: any[] = [];
    loading = true;
    errorMessage: string | null = null;

    constructor(
        private customerService: CustomerService,
        private toastService: ToastService,
        private confirmService: ConfirmDialogService
    ) { }

    ngOnInit(): void {
        this.loadCustomers();
    }

    loadCustomers(): void {
        this.loading = true;
        this.customerService.getCustomers().subscribe({
            next: (data) => {
                console.log('Customers received in component:', data);
                this.customers = data;
                this.loading = false;
                this.errorMessage = null;
            },
            error: (err) => {
                console.error('Erreur lors du chargement des clients:', err);
                this.errorMessage = err.error?.message || 'Erreur lors du chargement des clients. Vérifiez votre connexion au serveur.';
                this.loading = false;
            }
        });
    }

    async activateCustomer(id: string): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Voulez-vous vraiment valider cette inscription ?',
            'Valider l\'inscription',
            { confirmText: 'Valider', type: 'info' }
        );

        if (!confirmed) return;

        this.customerService.updateStatus(id, 'active').subscribe({
            next: () => {
                this.toastService.success('Compte activé avec succès');
                this.loadCustomers();
            },
            error: (err) => this.toastService.error('Erreur : ' + err.error?.message)
        });
    }

    async suspendCustomer(id: string): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Voulez-vous suspendre ce compte ?',
            'Suspendre le compte',
            { confirmText: 'Suspendre', type: 'warning' }
        );

        if (!confirmed) return;

        this.customerService.updateStatus(id, 'suspended').subscribe({
            next: () => {
                this.toastService.success('Compte suspendu');
                this.loadCustomers();
            },
            error: (err) => this.toastService.error('Erreur : ' + err.error?.message)
        });
    }

    async deleteCustomer(id: string): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            'Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.',
            'Supprimer le client',
            { confirmText: 'Supprimer', type: 'danger' }
        );

        if (!confirmed) return;

        this.customerService.deleteCustomer(id).subscribe({
            next: () => {
                this.toastService.success('Client supprimé');
                this.loadCustomers();
            },
            error: (err) => this.toastService.error('Erreur : ' + err.error?.message)
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'active': return 'status-active';
            case 'pending': return 'status-pending';
            case 'suspended': return 'status-suspended';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Actif';
            case 'pending': return 'En attente';
            case 'suspended': return 'Suspendu';
            default: return status;
        }
    }
}
