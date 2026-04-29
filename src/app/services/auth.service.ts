import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id:        string;
  email:     string;
  firstName: string;
  lastName:  string;
  phone?:    string;
  location?: string;
  summary?:  string;
}

export interface AuthResponse {
  token: string;
  user:  User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private api: ApiService, private router: Router) {}

  signup(data: { email: string; password: string; firstName: string; lastName: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/signup', data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
}