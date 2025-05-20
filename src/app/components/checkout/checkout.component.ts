import { Component, OnInit } from '@angular/core';
import { CartService } from '../../application/services/cart.service';
import { TransactionUseCase } from '../../application/use-cases/transaction.service';
import { AuthService } from '../../application/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../domain/models/cart-item.model';
import { ImageUrlPipe } from '../../infrastructure/pipes/image-url.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faCreditCard, 
  faShoppingBag,
  faTruck,
  faMoneyBill,
  faCalendar,
  faLock,
  faSpinner,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageUrlPipe, FontAwesomeModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  paymentDetails = { cardNumber: '', expiry: '', cvv: '' };
  loading: boolean = false;
  processing: boolean = false;

  constructor(
    private cartService: CartService,
    private transactionUseCase: TransactionUseCase,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faCreditCard,
      faShoppingBag,
      faTruck,
      faMoneyBill,
      faCalendar,
      faLock,
      faSpinner,
      faCheckCircle
    );
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.dialog.open(AlertDialogComponent, {
        data: { message: 'Please log in to proceed to checkout.' },
      });
      this.router.navigate(['/login']);
      return;
    }
    this.loadCart();
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

  calculateTotal(): void {
    this.total = this.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
  }

  placeOrder(): void {
    this.processing = true;
    this.transactionUseCase.createTransaction().subscribe({
      next: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Order placed successfully!' },
        });
        this.cartService.loadCartCount();
        this.processing = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to place order. Please try again.' },
        });
        this.processing = false;
      },
    });
  }
}