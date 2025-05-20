import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../infrastructure/http/api.service';
import { CartItem } from '../../domain/models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartUseCase {
  constructor(private apiService: ApiService) {}

  getCart(): Observable<CartItem[]> {
    return this.apiService.get('cart');
  }

  getCartCount(): Observable<{ count: number }> {
    return this.apiService.get('cart/count');
  }

  addToCart(productId: number, quantity: number): Observable<CartItem> {
    return this.apiService.post('cart', { product_id: productId, quantity });
  }

  updateCartItem(cartId: number, quantity: number): Observable<CartItem> {
    return this.apiService.put(`cart/${cartId}`, { quantity });
  }

  removeFromCart(cartId: number): Observable<void> {
    return this.apiService.delete(`cart/${cartId}`);
  }
}