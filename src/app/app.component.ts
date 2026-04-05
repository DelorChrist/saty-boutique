import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PromoPopupComponent } from './components/promo-popup/promo-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, ToastComponent, ConfirmDialogComponent, PromoPopupComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'saty-boutique';
}
