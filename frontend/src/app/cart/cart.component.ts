import { Component, OnInit } from '@angular/core';
import { CartService } from '../Services/cart.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';  // AuthService for token check
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})

export class CartComponent implements OnInit {

  public products: any = [];
  public grandtotal: number = 0;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService  // Injecting AuthService for token validation
  ) { }

  ngOnInit(): void {
    const token = this.authService.getToken();
    const customerId = this.authService.getCustomerId();

    if (!token || !customerId) {
      alert('Please login to save to cart.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadCartItems();  // Use a service method to load cart items
  }

  // Function to load cart items from backend
  loadCartItems(): void {
    const token = this.authService.getToken(); // Get the token
    if (!token) {
      alert('Please login to view your cart.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    console.log('Authorization Header:', headers.get('Authorization'));  // Log the Authorization header

    this.http.get(`http://localhost:5068/api/Cart`, { headers })
      .subscribe((res: any) => {
        console.log('Cart items fetched:', res);
        this.products = res;
        this.grandtotal = this.getTotal();
        this.cartService.cartItemList = this.products;
        this.cartService.productList.next(this.products);
      }, (err) => {
        console.error('Error fetching cart items:', err);
      });
  }


  getTotal(): number {
    return this.products.reduce((acc: number, item: any) => acc + item.total, 0);
  }

  removeItem(item: any): void {
    if (confirm('Are you sure you want to delete this item?')) {
      const token = this.authService.getToken();
      const customerId = this.authService.getCustomerId();
      if (!token || !customerId) {
        alert('User not logged in');
        this.router.navigate(['/login']);
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:5068/api/Cart/product/${item.productId}`, { headers })
        .subscribe({
          next: (res: any) => {
            // Now update the UI after confirmation from server:
            this.products = this.products.filter((p: any) => p.productId !== item.productId);
            this.grandtotal = this.getTotal();
            // this.cartService.removeCartItem(item);

            alert(res.message || 'Item deleted from cart!');
            console.log('Delete response:', res);
          },
          error: (err) => {
            console.error('Error deleting item from cart:', err);
            alert(err.error?.error || 'Error deleting item from cart.');
          }
        });
    }
  }


  updateQuantityInBackend(item: any) {
    const token = this.authService.getToken();
    if (!token) return;

    // No need to send customerId, backend gets from token
    const payload = {
      productId: item.productId,
      quantity: item.quantity
    };

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put('http://localhost:5068/api/Cart/update-quantity', payload, { headers })
      .subscribe({
        next: (res) => console.log('Quantity updated:', res),
        error: (err) => console.error('Failed to update quantity:', err)
      });
  }


  increaseQuantity(item: any) {
    item.quantity += 1;
    item.total = item.quantity * item.price;
    this.grandtotal = this.getTotal();
    this.updateQuantityInBackend(item);
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      item.total = item.quantity * item.price;
      this.grandtotal = this.getTotal();
      this.updateQuantityInBackend(item);
    } else {
      this.removeItem(item);
    }
  }




  refreshCart(): void {
    const customerId = localStorage.getItem('customerId');
    if (customerId) {
      this.loadCartItems();  // Re-fetch the cart
    }
  }

  emptyCart() {
    if (confirm('Are you sure you want to empty the cart?')) {
      const customerId = localStorage.getItem('customerId');
      if (!customerId) {
        alert('User not logged in');
        return;
      }

      this.products = [];
      this.grandtotal = 0;
      const token = this.authService.getToken();
      // this.cartService.removeAllCart();  // Clear cart state in CartService

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.delete(`http://localhost:5068/api/Cart/clear`, { headers, responseType: 'text' })

        .subscribe({
          next: () => alert('Cart cleared from DB!'),
          error: (err) => {
            console.error('Error clearing cart:', err);
            alert('Error clearing cart.');
          }
        });
    }
  }

  saveCartToDB() {
    if (this.products.length === 0) {
      alert("Cart is empty. Nothing to save!");
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    // Remove customerId since backend gets it from JWT
    const cleanedCart = this.products.map((item: any) => ({
      productId: item.productId,
      title: item.title,
      description: item.description,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    }));

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:5068/api/Cart/save', cleanedCart, { headers }).subscribe({
      next: (res) => {
        alert('Order placed successfully!');
        this.router.navigate(['/order-details'], { state: { orderItems: this.products, grandtotal: this.grandtotal } });
        this.cartService.removeAllCart();
        this.products = [];
        this.grandtotal = 0;
      },
      error: (err) => {
        console.error('Order save error:', err);
        alert('Failed to save order.');
      }
    });
  }


}
