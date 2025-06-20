import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as Array<string>;
    const token = this.authService.getToken();

    if (!token || !this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const decodedToken = this.decodeToken(token);

    const userRoles = decodedToken['role'] ||
      decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!userRoles) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

    const hasAccess = expectedRoles.some(role => rolesArray.includes(role));

    if (!hasAccess) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    console.log('Decoded token:', decodedToken);
    console.log('User roles:', rolesArray);
    console.log('Expected roles:', expectedRoles);

    return true;
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = atob(base64);
      
      return JSON.parse(decodedPayload);
    } catch (e) {
      return {};
    }
  }
  
}
