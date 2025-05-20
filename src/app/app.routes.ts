import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { ProductViewComponent } from './components/product-view/product-view.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AdminViewComponent } from './components/admin-view/admin-view.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: EditProfileComponent, canActivate: [AuthGuard] },
  { path: 'product/:id', component: ProductViewComponent },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminViewComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'products', component: HomeComponent },
  { path: '**', redirectTo: '' },
];