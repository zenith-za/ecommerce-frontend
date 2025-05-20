import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './application/services/auth.service';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'ecommerce-frontend';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  
  ngOnInit() {
    // Check authentication status on app start
    this.authService.checkAuthStatus().subscribe();
    
    // Track navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Scroll to top on page navigation, but only in browser environment
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
      }
    });
  }
}