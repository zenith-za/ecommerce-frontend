import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../application/services/auth.service';
import { ApiService } from '../../infrastructure/http/api.service';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { User } from '../../domain/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faAddressCard, 
  faSave, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './edit-profile.component.html',
})
export class EditProfileComponent implements OnInit {
  user: User = { id: 0, name: '', email: '', role: 'customer', billing_address: '' };
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    library: FaIconLibrary
  ) {
    library.addIcons(
      faUser,
      faEnvelope,
      faAddressCard,
      faSave,
      faSpinner
    );
  }

  ngOnInit(): void {
    this.loading = true;
    this.apiService.get<User>('profile').subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to load profile. Please try again.' },
        });
        this.loading = false;
      },
    });
  }

  updateProfile(): void {
    this.loading = true;
    this.apiService.put('profile', this.user).subscribe({
      next: () => {
        this.authService.setUser(this.user);
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Profile updated successfully!' },
        });
        this.loading = false;
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to update profile. Please try again.' },
        });
        this.loading = false;
      },
    });
  }
}