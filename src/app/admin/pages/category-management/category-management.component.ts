import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminProductService } from '../../services/admin-product.service';
import { Category } from '../../services/admin-product.service';

@Component({
    selector: 'app-category-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './category-management.component.html',
    styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit {
    categories: Category[] = [];
    categoryForm: FormGroup;
    isEditMode = false;
    editingCategoryId: string | null = null;
    loading = false;
    submitting = false;
    statusMessage: string | null = null;
    statusType: 'success' | 'error' = 'success';

    constructor(
        private fb: FormBuilder,
        private productService: AdminProductService
    ) {
        this.categoryForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            isActive: [true],
            displayOrder: [0]
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.loading = true;
        this.productService.getAllCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.loading = false;
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.categoryForm.invalid) return;

        this.submitting = true;
        const formValue = this.categoryForm.value;

        if (this.isEditMode && this.editingCategoryId) {
            this.productService.updateCategory(this.editingCategoryId, formValue).subscribe({
                next: () => {
                    this.statusMessage = 'Catégorie mise à jour !';
                    this.statusType = 'success';
                    this.resetForm();
                    this.loadCategories();
                },
                error: (err) => {
                    this.statusMessage = 'Erreur lors de la mise à jour';
                    this.statusType = 'error';
                    this.submitting = false;
                }
            });
        } else {
            this.productService.createCategory(formValue).subscribe({
                next: () => {
                    this.statusMessage = 'Catégorie créée !';
                    this.statusType = 'success';
                    this.resetForm();
                    this.loadCategories();
                },
                error: (err) => {
                    this.statusMessage = 'Erreur lors de la création';
                    this.statusType = 'error';
                    this.submitting = false;
                }
            });
        }
    }

    editCategory(cat: Category): void {
        this.isEditMode = true;
        this.editingCategoryId = cat.id;
        this.categoryForm.patchValue({
            name: cat.name,
            description: cat.description,
            isActive: cat.isActive,
            displayOrder: cat.displayOrder
        });
        this.statusMessage = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteCategory(id: string): void {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        this.productService.deleteCategory(id).subscribe({
            next: () => {
                this.statusMessage = 'Catégorie supprimée !';
                this.statusType = 'success';
                this.loadCategories();
            },
            error: (err) => {
                this.statusMessage = 'Erreur lors de la suppression';
                this.statusType = 'error';
            }
        });
    }

    resetForm(): void {
        this.isEditMode = false;
        this.editingCategoryId = null;
        this.categoryForm.reset({
            name: '',
            description: '',
            isActive: true,
            displayOrder: 0
        });
        this.submitting = false;
        setTimeout(() => this.statusMessage = null, 3000);
    }
}
