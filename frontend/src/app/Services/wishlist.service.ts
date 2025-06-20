import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'http://localhost:5068/api/Wishlist';
  // update if needed

  private count = new BehaviorSubject<number>(0);
  private wishlistItems = new BehaviorSubject<any[]>([]);

  wishlistCount$ = this.count.asObservable();
  wishlistItems$ = this.wishlistItems.asObservable();

  constructor(private http: HttpClient) {}

  private customerId = localStorage.getItem('customerId') || ''; // retrieve from login/localStorage

  // Load from backend
  loadWishlist() {
    if (!this.customerId) return;
    this.http.get<any[]>(`${this.apiUrl}/${this.customerId}`).subscribe(items => {
      this.wishlistItems.next(items);
      this.count.next(items.length);
    });
  }

  // Add item
  addToWishlist(item: any) {
    const wishlistItem = {
      customerId: this.customerId,
      productId: item.id,
      image: item.image,
      title: item.title,
      description: item.description,
      price: item.price
    };
  
    if (!this.wishlistItems.value.find(i => i.productId === wishlistItem.productId)) {
      this.http.post(`${this.apiUrl}/add`, wishlistItem, { responseType: 'text' }).subscribe(() => {
        const updated = [...this.wishlistItems.value, wishlistItem];
        this.wishlistItems.next(updated);
        this.count.next(updated.length);
      }, error => {
        console.error('Wishlist add error:', error);
        alert('Failed to add item to wishlist.');
      });
    }
  }
  
  increment() {
    this.count.next(this.count.value + 1);
  }
  // Remove item
  removeFromWishlist(productId: number) {
    this.http.delete(`${this.apiUrl}/product/${productId}/${this.customerId}`,{ responseType: 'text' }).subscribe(() => {
      const updated = this.wishlistItems.value.filter(i => i.productId !== productId);
      this.wishlistItems.next(updated);
      this.count.next(updated.length);
    });
  }

  // Clear all
  clearWishlist() {
    this.http.delete(`${this.apiUrl}/clear/${this.customerId}`,{ responseType: 'text' }).subscribe(() => {
      this.wishlistItems.next([]);
      this.count.next(0);
    });
  }

  getItems(): any[] {
    return this.wishlistItems.value;
  }

  updateWishlist(newList: any[]) {
    this.wishlistItems.next(newList);
    this.count.next(newList.length);
  }
}
