// auth.service.ts
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

const USERS_KEY = 'saty_users';
const CURRENT_USER_KEY = 'saty_current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      this.currentUser = JSON.parse(stored) as User;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private getAllUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  }

  private saveAllUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    district?: string;
  }): { ok: boolean; message: string } {
    const users = this.getAllUsers();

    if (users.some(u => u.email === data.email)) {
      return { ok: false, message: 'Un compte existe déjà avec cet email.' };
    }

    const user: User = {
      id: Date.now().toString(),
      fullName: data.fullName,
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      district: data.district,
      password: data.password,
    };

    users.push(user);
    this.saveAllUsers(users);

    this.currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { ok: true, message: 'Compte créé avec succès.' };
  }

  login(email: string, password: string): { ok: boolean; message: string } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { ok: false, message: 'Email ou mot de passe incorrect.' };
    }

    this.currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { ok: true, message: 'Connexion réussie.' };
  }

  // 🔹 logout simple
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // 🔹 Mettre à jour le profil de l'utilisateur courant
  updateUserProfile(updated: User): void {
    const users = this.getAllUsers();

    const index = users.findIndex(u => u.id === updated.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updated };
      this.saveAllUsers(users);
    }

    this.currentUser = updated;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  }

  // 🔹 Supprimer l'utilisateur courant
  deleteCurrentUser(): void {
    if (!this.currentUser) return;

    const users = this.getAllUsers().filter(u => u.id !== this.currentUser!.id);
    this.saveAllUsers(users);

    this.logout();
  }
}
