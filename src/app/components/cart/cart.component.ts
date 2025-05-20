import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../application/services/cart.service';
import { AuthService } from '../../application/services/auth.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../domain/models/cart-item.model';
import { ImageUrlPipe } from '../../infrastructure/pipes/image-url.pipe';
import { Subscription, filter } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faShoppingCart, 
  faTrash, 
  faSpinner, 
  faMinus, 
  faPlus, 
  faCreditCard,
  faShoppingBasket
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageUrlPipe, FontAwesomeModule],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  total: number = 0;
  private routerSubscription: Subscription | undefined;
  loading: boolean = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faShoppingCart,
      faTrash,
      faSpinner,
      faMinus,
      faPlus,
      faCreditCard,
      faShoppingBasket
    );
  }

  ngOnInit(): void {
    // Load cart initially
    this.loadCart();
    
    // Reload cart data whenever we navigate back to this component
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === '/cart') {
          this.loadCart();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to load cart. Please try again.' },
        });
        this.loading = false;
      },
    });
  }

  updateQuantity(item: any, quantity: number): void {
    if (quantity < 1) return;
    this.loading = true;
    this.cartService.updateCartItem(item.id, quantity).subscribe({
      next: () => {
        item.quantity = quantity;
        this.calculateTotal();
        // Refresh cart count
        this.cartService.loadCartCount();
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Cart updated successfully.' },
        });
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to update cart. Please try again.' },
        });
        this.loading = false;
      },
    });
  }

  removeItem(itemId: number): void {
    this.loading = true;
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
        this.calculateTotal();
        // Refresh cart count
        this.cartService.loadCartCount();
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Item removed from cart.' },
        });
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to remove item. Please try again.' },
        });
        this.loading = false;
      },
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.dialog.open(AlertDialogComponent, {
        data: { message: 'Please log in to proceed to checkout.' },
      });
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }
}