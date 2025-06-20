import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public cartItemList: any[] = [];
  public productList = new BehaviorSubject<any[]>([]);
  private baseUrl = "http://localhost:5068/api/Cart";
  // private productBaseUrl = "http://localhost:5068/api/product"; // Product API endpoint

  constructor(private http: HttpClient) {}

  // ✅ Build Authorization header with token from localStorage
  private authHeader() {
    const token = localStorage.getItem('jwtToken');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  // ✅ Observable for cart products
  getProducts(): Observable<any[]> {
    return this.productList.asObservable();
  }

  // ✅ Update local cart
  setProduct(product: any[]) {
    this.cartItemList.push(...product);
    this.productList.next(this.cartItemList);
  }

  // Add product to cart (both local cart and backend)
  addToCart(product: any) {
    const token = localStorage.getItem('jwtToken');  // Ensure the token is correct
    
    if (!token) {
      console.error('User is not authenticated');
      alert('Please log in to add items to the cart.');
      return;
    }
  
    // Ensure the product has the required properties
    if (product && product.productId && product.price && product.quantity > 0) {
      // Calculate the total (price * quantity)
      const total = product.price * product.quantity;
      
      // Add the total to the product object
      const cartProduct = { ...product, total: total };  // Ensure total is included in the product object
      
      // Push product to local cart for UI update
      this.cartItemList.push(cartProduct);
      this.productList.next(this.cartItemList);
    
      // Save to backend cart
      this.http.post(`${this.baseUrl}/save`, [cartProduct], this.authHeader()).subscribe({
        next: (res) => {
          console.log('Saved to Cart DB:', res);
        },
        error: (err) => {
          console.error('Error saving to Cart DB:', err);
        },
      });
    } else {
      console.error('Product data is incomplete or invalid');
      alert('Product data is incomplete or invalid');
    }
  }
  
  

  // ✅ Get total cost
  getTotal(): number {
    let grandtotal = 0;
    this.cartItemList.forEach((x: any) => {
      grandtotal += x.total;
    });
    return grandtotal;
  }

  // ✅ Remove one item from local cart
  removeCartItem(product: any) {
    const index = this.cartItemList.findIndex((item: any) => item.productId === product.productId);
    if (index === -1) {
      alert('Item no longer exists in your cart.');
      return;
    }
  
    this.http.delete(`${this.baseUrl}/product/${product.productId}`, this.authHeader())
      .subscribe({
        next: (res) => {
          console.log('Item deleted from DB:', res);
          // Update local cart state here:
          this.cartItemList.splice(index, 1);
          this.productList.next([...this.cartItemList]);
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert('Failed to delete item: ' + (err?.error?.message || err.message));
        }
      });
  }
  
  

  // ✅ Remove all local cart items and clear from backend
  removeAllCart() {
    this.cartItemList = [];
    this.productList.next(this.cartItemList);

    this.http.delete(`${this.baseUrl}/clear`, this.authHeader()).subscribe({
      next: () => console.log('Cart cleared from DB'),
      error: (err) => console.error('Error clearing cart:', err),
    });
  }

  // ✅ Load user-specific cart from backend after login
  loadCartFromDB() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('User is not authenticated');
      return;
    }
    this.http.get<any[]>(this.baseUrl, this.authHeader()).subscribe({
      next: (items) => {
        this.cartItemList = items;
        this.productList.next(items);
      },
      error: (err) => console.error('Error loading cart:', err),
    });
  }

  // ✅ Optional: Update quantity of a product in cart
  updateQuantity(productId: number, quantity: number, price: number) {
    const payload = {
      productId: productId,
      quantity: quantity,
    };

    this.http.put(`${this.baseUrl}/update-quantity`, payload, this.authHeader()).subscribe({
      next: () => {
        const index = this.cartItemList.findIndex((p) => p.productId === productId);
        if (index !== -1) {
          this.cartItemList[index].quantity = quantity;
          this.cartItemList[index].total = price * quantity;
          this.productList.next([...this.cartItemList]);
        }
      },
      error: (err) => console.error('Error updating quantity:', err),
    });
  }
}
