import { Component } from '@angular/core';
import { AuthService } from '../../application/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faSignInAlt, 
  faEnvelope, 
  faLock,
  faSpinner,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faSignInAlt,
      faEnvelope,
      faLock,
      faSpinner,
      faUserPlus
    );
  }

  onSubmit(): void {
    this.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          this.dialog.open(AlertDialogComponent, {
            data: { message: 'Login successful!' },
          });
          
          // AuthService will handle redirect to the stored URL or default
          // login() method now handles navigation
        }
        this.loading = false;
      },
      error: (err) => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Login failed. Please try again.' },
        });
        this.loading = false;
      },
    });
  }
}