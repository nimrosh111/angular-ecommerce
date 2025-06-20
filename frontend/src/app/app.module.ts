import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CustomerComponent } from './customer/customer.component';
import { Navbar2Component } from './navbar2/navbar2.component';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { PaymentComponent } from './payment/payment.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminComponentComponent } from './admin-component/admin-component.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AdminProductComponent } from './admin-product/admin-product.component';

 
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    CustomerComponent,
    Navbar2Component,
    ProductComponent,
    CartComponent,
    OrderDetailsComponent,
    PaymentComponent,
    WishlistComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AdminComponentComponent,
    UnauthorizedComponent,
    AdminProductComponent 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    ReactiveFormsModule,FormsModule,
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
