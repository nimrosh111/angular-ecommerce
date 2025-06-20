import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../Models/Product';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // Base URL for the product API
  private baseUrl = 'http://localhost:5068/api/Product';

  // Observable for search term
  public search = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  // Get all products from the API
  getProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);  // Calls /api/Product
  }

  
  // Add a product (Admin only)
  addProduct(product: Product): Observable<any> {
    return this.http.post(`${this.baseUrl}/import-single`, product, {
      headers: this.getAuthHeaders()
    });
  }

  // Update an existing product (Admin only)
  updateProduct(productId: number, product: Product): Observable<any> {
    return this.http.put(`${this.baseUrl}/${productId}`, product, {
      headers: this.getAuthHeaders()
    });
  }

  // Delete a product (Admin only)
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${productId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Method to get the Authorization headers (for admin actions)
  private getAuthHeaders() {
    const token = localStorage.getItem('token');  // Assuming token is stored in localStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
