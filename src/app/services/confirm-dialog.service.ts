import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogData {
  id: number;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private dialogSubject = new BehaviorSubject<ConfirmDialogData | null>(null);
  public dialog$ = this.dialogSubject.asObservable();
  private nextId = 1;

  constructor() {}

  confirm(
    message: string,
    title: string = 'Confirmation',
    options: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    } = {}
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog: ConfirmDialogData = {
        id: this.nextId++,
        title,
        message,
        confirmText: options.confirmText || 'Confirmer',
        cancelText: options.cancelText || 'Annuler',
        type: options.type || 'info',
        resolve
      };
      this.dialogSubject.next(dialog);
    });
  }

  close(confirmed: boolean): void {
    const currentDialog = this.dialogSubject.value;
    if (currentDialog?.resolve) {
      currentDialog.resolve(confirmed);
    }
    this.dialogSubject.next(null);
  }
}
