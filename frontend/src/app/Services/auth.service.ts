import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginResponse, RegisterResponse } from '../Models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'http://localhost:5068/User';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials);
  }

  register(data: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, data);
  }

  storeToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }
  
  storeCustomerId(id: string) {
    localStorage.setItem('customerId', id);
  }
  
  getCustomerId(): string | null {
    return localStorage.getItem('customerId');
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('customerId');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));

      if (!decoded.exp) return false;

      const expiryMs = decoded.exp * 1000;
      return Date.now() < expiryMs;
    } catch {
      return false;
    }
  }

  /**
   * Get the user's roles from the JWT token.
   */
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
  
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      const roles = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  
      return Array.isArray(roles) ? roles : [roles];
    } catch (e) {
      console.error('Invalid token', e);
      return [];
    }
  }

  /**
   * Get customerId and role from JWT token.
   */
  getCustomerIdAndRole(): { customerId: string; role: string } | null {
    const token = this.getToken();
    if (!token) return null;
  
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
  
      const customerId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  
      if (!customerId || !role) return null;
  
      return { customerId, role };
    } catch (e) {
      console.error('JWT parse error', e);
      return null;
    }
  }
  
}
