import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthUseCase } from '../use-cases/auth.service';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private redirectUrl: string | null = null;

  constructor(
    private authUseCase: AuthUseCase,
    private router: Router
  ) {
    // Sync initial state
    this.refreshAuthStateFromStorage();
  }

  // Inject CartService using setter to avoid circular dependency
  private _cartService: CartService | null = null;
  setCartService(service: CartService): void {
    this._cartService = service;
  }

  private refreshAuthStateFromStorage(): void {
    const isAuthenticated = this.authUseCase.isAuthenticated();
    this.isAuthenticatedSubject.next(isAuthenticated);
    
    if (isAuthenticated) {
      this.checkAuthStatus();
    }
  }

  checkAuthStatus(): Observable<any> {
    return this.authUseCase.checkAuthStatus().pipe(
      tap(response => {
        if (response && response.user) {
          this.user = response.user;
          this.isAuthenticatedSubject.next(true);
        } else {
          this.isAuthenticatedSubject.next(false);
        }
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        return of(null);
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.authUseCase.login(credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.setToken(response.token);
          this.user = response.user;
          this.isAuthenticatedSubject.next(true);
          
          // Navigate to the redirect URL if one exists, or to the home page
          const redirectTo = this.redirectUrl || '/';
          this.redirectUrl = null;
          this.router.navigateByUrl(redirectTo);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.authUseCase.register(data);
  }

  logout(): void {
    this.authUseCase.logout();
    this.user = null;
    this.isAuthenticatedSubject.next(false);
    
    // Clear cart count if CartService is available
    if (this._cartService) {
      this._cartService.clearCart();
    }
    
    // Clear any stored navigation state
    this.redirectUrl = null;
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  // Store the URL so we can redirect after login
  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  isAuthenticated(): boolean {
    return this.authUseCase.isAuthenticated();
  }

  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  isAdmin(): boolean {
    return this.authUseCase.isAdmin();
  }

  setUser(user: any): void {
    this.user = user;
  }

  getUser(): any {
    return this.user;
  }

  setToken(token: string): void {
    this.authUseCase.setToken(token);
  }
}