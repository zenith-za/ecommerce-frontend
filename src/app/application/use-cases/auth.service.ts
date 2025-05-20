import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../infrastructure/http/api.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthUseCase {
  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.post('login', credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.apiService.post('register', data);
  }

  logout(): void {
    const token = this.apiService.getToken();
    
    // Only try to call logout if we have a token
    if (token) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      });
      
      // Try to call the logout endpoint (required for Laravel JWT to blacklist the token)
      this.apiService.post('logout', {}, headers).subscribe({
        complete: () => {
          this.cleanupTokens();
        },
        error: () => {
          // Even if server-side logout fails, clean up client-side
          this.cleanupTokens();
        }
      });
    } else {
      // No token, just clean up locally
      this.cleanupTokens();
    }
  }

  private cleanupTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
    }
    this.apiService.setToken('');
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    const token = this.apiService.getToken();
    if (!token) return false;
    
    return !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Laravel JWT uses 'exp' for expiration timestamp
      if (!payload.exp) return false;
      
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      return now > expirationDate;
    } catch (e) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  isAdmin(): boolean {
    const token = this.apiService.getToken();
    if (!token || this.isTokenExpired(token)) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch (e) {
      return false;
    }
  }

  refreshToken(): Observable<any> {
    const token = this.apiService.getToken();
    
    if (!token) {
      return throwError(() => new Error('No token available for refresh'));
    }
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
    
    return this.apiService.post('refresh', {}, headers).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  checkAuthStatus(): Observable<any> {
    return this.apiService.get('check-auth');
  }

  setToken(token: string): void {
    this.apiService.setToken(token);
  }
}