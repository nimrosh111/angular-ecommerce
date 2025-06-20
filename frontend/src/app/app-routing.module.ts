import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Navbar2Component } from './navbar2/navbar2.component';
import { CustomerComponent } from './customer/customer.component';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { PaymentComponent } from './payment/payment.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthGuard } from './Models/auth.guard';
import { AdminComponentComponent } from './admin-component/admin-component.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AdminProductComponent } from './admin-product/admin-product.component';


const routes: Routes = [
  { path: '', redirectTo: '/navbar', pathMatch: 'full' },
  { path: 'navbar', component: NavbarComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponentComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'customer', component: CustomerComponent, canActivate: [AuthGuard], data: { roles: ['Customer', 'Admin'] } },
  { path: 'register', component: RegisterComponent },
  { path: 'navbar2', component: Navbar2Component, canActivate: [AuthGuard], data: { roles: ['Customer', 'Admin'] } },

  {path:'product',component:ProductComponent},
  {path:'cart',component:CartComponent},
  {path:'order-details', component:OrderDetailsComponent},
  {path:'payment',component:PaymentComponent},
  {path:'wishlist',component:WishlistComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password', component: ResetPasswordComponent},
  {path:'unauthorized',component:UnauthorizedComponent},
  {
    path: 'adminproduct',
    component: AdminProductComponent,
    canActivate: [AuthGuard], // Optional: add admin role guard
    data: { roles: ['Admin'] }
  }
  
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
