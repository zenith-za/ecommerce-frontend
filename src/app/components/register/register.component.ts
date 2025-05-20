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
  faUserPlus, 
  faUser, 
  faEnvelope, 
  faLock,
  faAddressCard,
  faSpinner,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FontAwesomeModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  data = { name: '', email: '', password: '', billing_address: '' };
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faUserPlus,
      faUser,
      faEnvelope,
      faLock,
      faAddressCard,
      faSpinner,
      faSignInAlt
    );
  }

  register(): void {
    this.loading = true;
    this.authService.register(this.data).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Registration successful! Please log in.' },
        });
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Registration failed. Please try again.' },
        });
        this.loading = false;
      },
    });
  }
}