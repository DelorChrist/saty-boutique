import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, ConfirmDialogData } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="dialog" class="confirm-overlay" (click)="onOverlayClick($event)">
      <div class="confirm-dialog" [class.danger]="dialog.type === 'danger'" [class.warning]="dialog.type === 'warning'">
        <div class="confirm-header">
          <h3>{{ dialog.title }}</h3>
        </div>
        <div class="confirm-body">
          <p>{{ dialog.message }}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn-cancel" (click)="onCancel()">
            {{ dialog.cancelText }}
          </button>
          <button 
            class="btn-confirm" 
            [class.btn-danger]="dialog.type === 'danger'"
            [class.btn-warning]="dialog.type === 'warning'"
            (click)="onConfirm()">
            {{ dialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .confirm-dialog {
      background: white;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .confirm-header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .confirm-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .confirm-body {
      padding: 1.5rem;
    }

    .confirm-body p {
      margin: 0;
      color: #666;
      font-size: 1rem;
      line-height: 1.6;
    }

    .confirm-footer {
      padding: 1rem 1.5rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn-cancel,
    .btn-confirm {
      padding: 0.625rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: #f5f5f5;
      color: #666;
    }

    .btn-cancel:hover {
      background: #e0e0e0;
    }

    .btn-confirm {
      background: #2196f3;
      color: white;
    }

    .btn-confirm:hover {
      background: #1976d2;
    }

    .btn-confirm.btn-danger {
      background: #e53935;
    }

    .btn-confirm.btn-danger:hover {
      background: #d32f2f;
    }

    .btn-confirm.btn-warning {
      background: #ff9800;
    }

    .btn-confirm.btn-warning:hover {
      background: #f57c00;
    }

    @media (max-width: 768px) {
      .confirm-dialog {
        min-width: 90%;
        max-width: 90%;
      }
    }
  `]
})
export class ConfirmDialogComponent implements OnInit {
  dialog: ConfirmDialogData | null = null;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.confirmService.dialog$.subscribe(dialog => {
      this.dialog = dialog;
    });
  }

  onConfirm(): void {
    this.confirmService.close(true);
  }

  onCancel(): void {
    this.confirmService.close(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
