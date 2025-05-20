import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartUseCase } from '../use-cases/cart.service';
import { CartItem } from '../../domain/models/cart-item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(
    private cartUseCase: CartUseCase,
    @Optional() private authService: AuthService
  ) {
    // Delayed initialization to avoid circular dependency
    setTimeout(() => {
      if (this.authService) {
        // Set this cart service on the auth service for logout handling
        this.authService.setCartService(this);
        
        this.authService.isAuthenticated$().subscribe(isAuthenticated => {
          if (isAuthenticated) {
            this.loadCartCount();
          } else {
            this.cartCountSubject.next(0);
          }
        });
      }
    });
  }

  getCart(): Observable<CartItem[]> {
    return this.cartUseCase.getCart();
  }

  addToCart(productId: number, quantity: number): Observable<CartItem> {
    const result = this.cartUseCase.addToCart(productId, quantity);
    result.subscribe({
      next: () => this.loadCartCount(),
      error: () => {}
    });
    return result;
  }

  updateCartItem(cartId: number, quantity: number): Observable<CartItem> {
    const result = this.cartUseCase.updateCartItem(cartId, quantity);
    result.subscribe({
      next: () => this.loadCartCount(),
      error: () => {}
    });
    return result;
  }

  removeFromCart(cartId: number): Observable<void> {
    const result = this.cartUseCase.removeFromCart(cartId);
    result.subscribe({
      next: () => this.loadCartCount(),
      error: () => {}
    });
    return result;
  }

  loadCartCount(): void {
    if (!this.authService.isAuthenticated()) {
      this.cartCountSubject.next(0);
      return;
    }
    
    this.cartUseCase.getCartCount()
      .pipe(
        catchError(() => {
          console.error('Failed to load cart count');
          return of({ count: 0 });
        })
      )
      .subscribe(data => this.cartCountSubject.next(data.count));
  }

  clearCart(): void {
    this.cartCountSubject.next(0);
  }
} 