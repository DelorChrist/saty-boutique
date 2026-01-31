// connexion.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
   // adapte le chemin
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
    private authService: AuthService
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.redirectUrl = params.get('redirect') || '/';
    });
  }

  switchView(view: AuthView): void {
    this.view = view;
  }

  onSubmitLogin(): void {
    const result = this.authService.login(
      this.loginEmail.trim(),
      this.loginPassword
    );

    if (!result.ok) {
      alert(result.message);
      return;
    }

    this.router.navigateByUrl(this.redirectUrl);
  }

  onSubmitSignup(): void {
    if (this.signupPassword !== this.signupConfirm) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    const registerResult = this.authService.register({
      fullName: this.signupName.trim(),
      email: this.signupEmail.trim(),
      phone: this.signupNumber.trim(),
      password: this.signupPassword,
      // address, city, district pourront être ajoutés plus tard
    });

    if (!registerResult.ok) {
      alert(registerResult.message);
      return;
    }

    this.router.navigateByUrl(this.redirectUrl);
  }
}
