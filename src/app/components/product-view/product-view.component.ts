import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule, NavigationEnd, Router } from '@angular/router';
import { ProductService } from '../../application/services/product.service';
import { CartService } from '../../application/services/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { Product } from '../../domain/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUrlPipe } from '../../infrastructure/pipes/image-url.pipe';
import { Subscription, filter } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faShoppingCart, 
  faArrowLeft, 
  faDollarSign, 
  faInfoCircle,
  faSpinner,
  faMinus,
  faPlus,
  faTag,
  faImage,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageUrlPipe, FontAwesomeModule],
  templateUrl: './product-view.component.html',
})
export class ProductViewComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  quantity: number = 1;
  private paramSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined;
  loading: boolean = true;
  addingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private dialog: MatDialog,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faShoppingCart,
      faArrowLeft,
      faDollarSign,
      faInfoCircle,
      faSpinner,
      faMinus,
      faPlus,
      faTag,
      faImage,
      faBoxOpen
    );
  }

  ngOnInit(): void {
    // Handle initial load and parameter changes
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });

    // Handle navigation back to this component
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.includes('/product/')) {
          const id = Number(this.route.snapshot.paramMap.get('id'));
          if (id) {
            this.loadProduct(id);
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        // Reset quantity to 1 for new product
        this.quantity = 1;
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to load product. Please try again.' },
        });
        this.loading = false;
      },
    });
  }

  addToCart(): void {
    if (this.product) {
      this.addingToCart = true;
      this.cartService.addToCart(this.product.id, this.quantity).subscribe({
        next: () => {
          // Ensure cart count is updated
          this.cartService.loadCartCount();
          
          this.dialog.open(AlertDialogComponent, {
            data: { message: 'Product added to cart!' },
          });
          this.addingToCart = false;
        },
        error: () => {
          this.dialog.open(AlertDialogComponent, {
            data: { message: 'Failed to add to cart. Please try again.' },
          });
          this.addingToCart = false;
        },
      });
    }
  }
  
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  incrementQuantity(): void {
    this.quantity++;
  }
}