import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminProductService, Product, Category } from '../../services/admin-product.service';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
    productForm: FormGroup;
    isEditMode = false;
    productId: string | null = null;
    categories$: Observable<Category[]>;
    imageFiles: File[] = [];
    previewImages: string[] = [];
    submitting = false;
    statusMessage: string | null = null;
    statusType: 'success' | 'error' = 'success';

    constructor(
        private fb: FormBuilder,
        private productService: AdminProductService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.categories$ = this.productService.getAllCategories();
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            brand: ['Saty Collection'],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            oldPrice: [null],
            stock: [0, [Validators.required, Validators.min(0)]],
            categoryId: ['', Validators.required], // Note: backend expects 'category' ID but form is categoryId
            variants: this.fb.array([]),
            isActive: [true],
            isFeatured: [false],
            isBestSeller: [false]
        });
    }

    get variants() {
        return this.productForm.get('variants') as FormArray;
    }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id');
        if (this.productId) {
            this.isEditMode = true;
            this.productService.getProductById(this.productId).subscribe(product => {
                this.patchForm(product);
            });
        }

        // Debug: Log form status changes
        this.productForm.statusChanges.subscribe(status => {
            console.log('Form Status:', status);
            if (status === 'INVALID') {
                const invalid = [];
                const controls = this.productForm.controls;
                for (const name in controls) {
                    if (controls[name].invalid) {
                        invalid.push(name);
                    }
                }
                console.log('Invalid Fields:', invalid);
            }
        });
    }

    addVariant() {
        const variantGroup = this.fb.group({
            size: [''],
            stock: [0],
            color: [''],
            priceAdjustment: [0],
            sku: ['']
        });
        this.variants.push(variantGroup);
    }

    removeVariant(index: number) {
        this.variants.removeAt(index);
    }

    onFileChange(event: any) {
        if (event.target.files && event.target.files.length) {
            this.imageFiles = Array.from(event.target.files);

            // Previews
            this.previewImages = [];
            this.imageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previewImages.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    patchForm(product: Product) {
        this.productForm.patchValue({
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            oldPrice: product.oldPrice,
            stock: product.stock,
            categoryId: typeof product.categoryId === 'object' ? (product.categoryId as any).id : product.categoryId || (product as any).category?.id || (product as any).category,
            // Handle population logic difference if needed. Backend populates category, so it might be an object.
            // My backend implementation populates 'category', but frontend interface says 'categoryId'. 
            // I should adjust to ensure we extract ID.
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            isBestSeller: (product as any).isBestSeller || false
        });

        // Populate variants
        if (product.variants) {
            product.variants.forEach(v => {
                const variantGroup = this.fb.group({
                    size: [v.size],
                    stock: [v.stock],
                    color: [v.color],
                    priceAdjustment: [v.priceAdjustment],
                    sku: [v.sku]
                });
                this.variants.push(variantGroup);
            });
        }

        // Existing images preview
        if (product.images) {
            this.previewImages = product.images.map(img =>
                img.startsWith('http') ? img : `${environment.apiUrl.replace('/api', '')}${img}`
            );
        }
    }

    onSubmit() {
        if (this.productForm.invalid) return;

        this.submitting = true;
        const formData = new FormData();

        const formValue = this.productForm.value;

        // Append fields
        Object.keys(formValue).forEach(key => {
            if (key === 'variants') {
                formData.append('variants', JSON.stringify(formValue.variants));
            } else if (key === 'categoryId') {
                formData.append('category', formValue.categoryId); // Backend expects 'category'
            } else {
                formData.append(key, formValue[key]);
            }
        });

        // Append images
        this.imageFiles.forEach(file => {
            formData.append('images', file);
        });

        if (this.isEditMode && this.productId) {
            this.productService.updateProduct(this.productId, formData).subscribe({
                next: () => {
                    this.statusMessage = 'Produit mis à jour avec succès !';
                    this.statusType = 'success';
                    setTimeout(() => this.router.navigate(['/admin/products']), 1500);
                },
                error: (err) => {
                    console.error(err);
                    this.statusMessage = 'Erreur lors de la mise à jour : ' + (err.error?.message || 'Erreur inconnue');
                    this.statusType = 'error';
                    this.submitting = false;
                }
            });
        } else {
            this.productService.createProduct(formData).subscribe({
                next: () => {
                    this.statusMessage = 'Produit créé avec succès !';
                    this.statusType = 'success';
                    setTimeout(() => this.router.navigate(['/admin/products']), 1500);
                },
                error: (err) => {
                    console.error(err);
                    const details = err.error?.details ? ` (${err.error.details.join(', ')})` : '';
                    this.statusMessage = 'Erreur lors de la création : ' + (err.error?.message || 'Erreur inconnue') + details;
                    this.statusType = 'error';
                    this.submitting = false;
                }
            });
        }
    }
}
