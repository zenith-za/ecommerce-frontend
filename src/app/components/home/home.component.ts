import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../application/services/product.service';
import { ApiService } from '../../infrastructure/http/api.service';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Product } from '../../domain/models/product.model';
import { Category } from '../../domain/models/category.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUrlPipe } from '../../infrastructure/pipes/image-url.pipe';
import { Subscription, filter } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faShoppingCart, 
  faTags, 
  faEye,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ImageUrlPipe, FontAwesomeModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number | null = null;
  private routerSubscription: Subscription | undefined;
  private queryParamSubscription: Subscription | undefined;
  loading: boolean = true;

  constructor(
    private productService: ProductService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faSearch,
      faFilter,
      faShoppingCart,
      faTags,
      faEye,
      faSpinner
    );
  }

  ngOnInit(): void {
    // Check for category query param
    this.queryParamSubscription = this.route.queryParams.subscribe(params => {
      const categoryId = params['category_id'] ? Number(params['category_id']) : null;
      this.selectedCategory = categoryId;
      this.loadProducts(this.selectedCategory || undefined);
    });

    // Load categories
    this.loadCategories();
    
    // Reload data on navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === '/' || this.router.url === '/products') {
          // Only reload if no category param to avoid double loading
          if (!this.route.snapshot.queryParams['category_id']) {
            this.loadProducts();
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
  }

  loadProducts(categoryId?: number): void {
    this.loading = true;
    this.productService.getProducts(categoryId).subscribe({
      next: (products) => {
        this.filteredProducts = products;
        this.loading = false;
      },
      error: () => {
        console.error('Failed to load products');
        this.loading = false;
      },
    });
  }

  loadCategories(): void {
    this.apiService.get<Category[]>('categories').subscribe({
      next: (categories) => (this.categories = categories),
      error: () => console.error('Failed to load categories'),
    });
  }

  onCategoryChange(): void {
    // Update URL with category parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.selectedCategory ? { category_id: this.selectedCategory } : {},
      queryParamsHandling: 'merge'
    });
    this.loadProducts(this.selectedCategory ?? undefined);
  }

  getSelectedCategoryName(): string {
    if (!this.selectedCategory) return '';
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category ? category.name : '';
  }
}