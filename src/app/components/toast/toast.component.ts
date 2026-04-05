import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        [class]="'toast toast-' + toast.type"
        [@fadeSlide]>
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg *ngIf="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg *ngIf="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg *ngIf="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="close(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 5rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: #4caf50;
      background: #f1f8f4;
    }

    .toast-success .toast-icon {
      color: #4caf50;
    }

    .toast-error {
      border-left-color: #e53935;
      background: #ffecec;
    }

    .toast-error .toast-icon {
      color: #e53935;
    }

    .toast-warning {
      border-left-color: #ff9800;
      background: #fff8e1;
    }

    .toast-warning .toast-icon {
      color: #ff9800;
    }

    .toast-info {
      border-left-color: #2196f3;
      background: #e3f2fd;
    }

    .toast-info .toast-icon {
      color: #2196f3;
    }

    .toast-icon {
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: 0.9rem;
      color: #333;
      font-weight: 500;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #333;
    }

    @media (max-width: 768px) {
      .toast-container {
        right: 0.5rem;
        left: 0.5rem;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  close(id: number): void {
    this.toastService.remove(id);
  }
}
