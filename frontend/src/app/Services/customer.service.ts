import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../Models/customer';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private API_URL = 'http://localhost:5068/api/Customer';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ✅ Get customer by ID with token
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching customer', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Update customer
  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.API_URL}/${customer.id}`, customer, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Delete customer
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Get all customers (admin only)
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.API_URL, {
      headers: this.getAuthHeaders()
    });
  }
}
