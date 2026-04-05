import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mon-compte.component.html',
  styleUrls: ['./mon-compte.component.scss'],
})
export class MonCompteComponent implements OnInit {
  currentUser: User | null = null;

  profileForm!: FormGroup;
  addressForm!: FormGroup;

  saving = false;
  editing = false;
  editingAddress = false;
  deleteConfirm = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    public favoritesService: FavoritesService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/connexion'], {
        queryParams: { redirect: '/mon-compte' },
      });
      return;
    }

    this.profileForm = this.fb.group({
      fullName: [
        this.currentUser.fullName || this.currentUser.name || `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        [Validators.required],
      ],
      email: [
        this.currentUser.email,
        [Validators.required, Validators.email],
      ],
      phone: [this.currentUser.phone, [Validators.required]],
    });

    this.addressForm = this.fb.group({
      address: [this.currentUser.address || ''],
      city: [this.currentUser.city || ''],
      district: [this.currentUser.district || ''],
    });
  }

  /* --------- Sidebar navigation --------- */

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  /* --------- Navigation vers produit (recommandations) --------- */

  goToProduct(id: string): void {
    this.router.navigate(['/details-produit', id]);
  }

  /* --------- Profil (infos personnelles) --------- */

  toggleEdit(): void {
    this.editing = !this.editing;
  }

  onSubmit(): void {
    if (!this.profileForm.valid || !this.currentUser) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const fullName = this.profileForm.value.fullName;
    const parts = fullName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';

    const updated: User = {
      ...this.currentUser,
      firstName,
      lastName,
      fullName: fullName,
      name: fullName,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone,
    };

    this.authService.updateUserProfile(updated).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.saving = false;
        this.editing = false;
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
      }
    });
  }

  /* --------- Adresse --------- */

  toggleEditAddress(): void {
    this.editingAddress = !this.editingAddress;
  }

  onSubmitAddress(): void {
    if (!this.addressForm.valid || !this.currentUser) return;

    const updated: User = {
      ...this.currentUser,
      address: this.addressForm.value.address,
      city: this.addressForm.value.city,
      district: this.addressForm.value.district,
    };

    this.authService.updateUserProfile(updated).subscribe({
      next: (user) => {
        this.currentUser = user;
        this.editingAddress = false;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  /* --------- Suppression de compte --------- */

  onDeleteAccount(): void {
    if (!this.currentUser) return;

    if (!this.deleteConfirm) {
      this.deleteConfirm = true;
      return;
    }

    this.authService.deleteCurrentUser().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.deleteConfirm = false;
      }
    });
  }

  /* --------- Recommandations : panier + favoris --------- */

  addToCartFromRecommendations(product: {
    id: string;
    name: string;
    price: number;
    image: string;
  }): void {
    this.cartService.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: null,
      color: null,
      quantity: 1,
    });

    alert(`${product.name} ajouté au panier !`);
  }

  toggleFavorite(product: {
    id: string;
    name: string;
    price: number;
    image: string;
    categorySlug?: string;
  }): void {
    const isFav = this.favoritesService.toggleFavorite({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categorySlug: product.categorySlug || '',
      addedAt: new Date().toISOString(),
    });

    if (isFav) {
      alert(`${product.name} ajouté aux favoris ❤️`);
    } else {
      alert(`${product.name} retiré des favoris`);
    }
  }

  /* --------- Utilitaires de template (optionnels) --------- */

  get profileControls() {
    return this.profileForm?.controls || {};
  }

  get addressControls() {
    return this.addressForm?.controls || {};
  }
}
