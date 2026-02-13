import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthUser, AuthResponse } from '@shared/interfaces/auth.interface';
import { environment } from '../../environments/environment';
import { IAuthService } from './auth.service.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends IAuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  override currentUser = signal<AuthUser | null>(null);
  override isLoggedIn = signal(false);

  constructor() {
    super();
    this.checkToken();
  }

  private checkToken() {
    const token = localStorage.getItem('pokedex_token');
    const user = localStorage.getItem('pokedex_user');
    if (token && user) {
      try {
        this.currentUser.set(JSON.parse(user));
        this.isLoggedIn.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }

  override login(name: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { name, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  override register(name: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, { name, password });
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem('pokedex_token', res.token);
    localStorage.setItem('pokedex_user', JSON.stringify(res.payload));
    this.currentUser.set(res.payload);
    this.isLoggedIn.set(true);
  }

  override logout() {
    localStorage.removeItem('pokedex_token');
    localStorage.removeItem('pokedex_user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  override getToken(): string | null {
    return localStorage.getItem('pokedex_token');
  }
}
