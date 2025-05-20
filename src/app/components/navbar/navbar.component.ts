import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';
import { CartService } from '../../application/services/cart.service';
import { Observable, Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faShoppingCart, 
  faUser, 
  faSignInAlt, 
  faUserPlus, 
  faSignOutAlt, 
  faStore, 
  faShieldAlt,
  faSun,
  faMoon,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated$: Observable<boolean>;
  cartCount: number = 0;
  isDarkMode: boolean = false;
  isMobileMenuOpen: boolean = false;
  private cartCountSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    library: FaIconLibrary,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$();
    library.addIcons(
      faShoppingCart, 
      faUser, 
      faSignInAlt, 
      faUserPlus, 
      faSignOutAlt, 
      faStore,
      faShieldAlt,
      faSun,
      faMoon,
      faBars,
      faTimes
    );
  }

  ngOnInit(): void {
    // Check if dark mode was previously enabled
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = localStorage.getItem('darkMode') === 'true';
      this.applyTheme();
    }
    
    // Subscribe to cart count updates
    this.cartCountSubscription = this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
    
    // When authentication state changes, update cart count
    this.authSubscription = this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.cartService.loadCartCount();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartCountSubscription) {
      this.cartCountSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    // Reset cart count to 0 on logout
    this.cartCount = 0;
    // Close mobile menu when logging out
    this.isMobileMenuOpen = false;
  }
  
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', this.isDarkMode.toString());
      this.applyTheme();
    }
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
  
  private applyTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
