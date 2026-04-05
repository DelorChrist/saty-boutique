// connexion.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

type AuthView = 'login' | 'signup';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent {
  view: AuthView = 'login';

  // login
  loginEmail = '';
  loginPassword = '';

  // signup
  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirm = '';
  signupNumber = '';

  redirectUrl = '/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.redirectUrl = params.get('redirect') || '/';
    });
  }

  switchView(view: AuthView): void {
    this.view = view;
  }

  onSubmitLogin(): void {
    this.authService.login(this.loginEmail.trim(), this.loginPassword).subscribe({
      next: (res) => {
        console.log('🔐 [CLIENT LOGIN] Connexion réussie, rôle:', res.user?.role);
        
        // Bloquer l'accès aux comptes admin depuis la page client
        if (res.user?.role === 'admin') {
          console.log('🚫 [CLIENT LOGIN] Compte admin détecté - accès refusé sur cette page');
          // Déconnecter immédiatement pour ne pas garder le token
          this.authService.logout();
          this.notificationService.error('Identifiants incorrects. Veuillez vérifier vos informations de connexion.');
          return;
        }
        
        // Rediriger les clients vers la page demandée ou l'accueil
        console.log('👤 [CLIENT LOGIN] Client détecté - redirection vers', this.redirectUrl);
        this.router.navigateByUrl(this.redirectUrl);
      },
      error: (err) => {
        console.error('❌ [CLIENT LOGIN] Erreur:', err);
        this.notificationService.error(err.error?.message || 'Erreur lors de la connexion');
      }
    });
  }

  onSubmitSignup(): void {
    if (this.signupPassword !== this.signupConfirm) {
      this.notificationService.warning('Les mots de passe ne correspondent pas.');
      return;
    }

    console.log('Sending signup request:', {
      fullName: this.signupName.trim(),
      email: this.signupEmail.trim(),
      phone: this.signupNumber.trim(),
      password: this.signupPassword,
    });

    this.authService.register({
      fullName: this.signupName.trim(),
      email: this.signupEmail.trim(),
      phone: this.signupNumber.trim(),
      password: this.signupPassword,
    }).subscribe({
      next: (res) => {
        this.notificationService.success('Votre compte a été créé ! Un administrateur doit maintenant le valider avant que vous puissiez vous connecter.');
        this.switchView('login');
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }
}
