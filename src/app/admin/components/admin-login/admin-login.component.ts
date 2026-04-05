import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Rediriger si déjà connecté comme admin
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    console.log('🔐 [ADMIN LOGIN] Tentative de connexion avec:', email);

    this.authService.login(email, password).subscribe({
      next: (res) => {
        console.log('✅ [ADMIN LOGIN] Réponse du serveur:', res);
        console.log('👤 [ADMIN LOGIN] Role utilisateur:', res.user?.role);
        
        if (res.user.role === 'admin') {
          console.log('✅ [ADMIN LOGIN] Role admin confirmé - redirection vers dashboard');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          console.log('🚀 [ADMIN LOGIN] Navigation vers:', returnUrl);
          
          this.router.navigate([returnUrl]).then(success => {
            console.log('📍 [ADMIN LOGIN] Navigation réussie?', success);
            if (!success) {
              console.error('❌ [ADMIN LOGIN] Échec de la navigation!');
            }
          });
        } else {
          console.warn('⚠️ [ADMIN LOGIN] Accès refusé - role:', res.user.role);
          this.authService.logout();
          this.errorMessage = 'Accès refusé. Vous n\'êtes pas administrateur.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ [ADMIN LOGIN] Erreur de connexion:', err);
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
