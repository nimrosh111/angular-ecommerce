import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  Loginfg: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private authService:AuthService
  ) {
    this.Loginfg = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('registeredUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.Loginfg.patchValue({
        username: user.username
      });
    }
  }

  onSubmit() {
    if (this.Loginfg.valid) {
      const loginData = this.Loginfg.value;
      const apiUrl = 'http://localhost:5068/User/login';
  
      this.http.post(apiUrl, loginData).subscribe({
        next: (response: any) => {
          console.log('Login response:', response);
          const { jwtToken, customerId, roles } = response;
  
          this.authService.storeToken(jwtToken);
          this.authService.storeCustomerId(customerId);
  
          alert('Login successful!');
  
          // ✅ Normalize role to array
          const roleList = Array.isArray(roles) ? roles : [roles];
  
          console.log("User roles:", roleList); // ✅ For debugging
  
          // ✅ Redirect based on roles
          if (roleList.includes('Admin')) {
            this.router.navigate(['/admin']);
          } else if (roleList.includes('Customer')) {
            this.router.navigate(['/navbar2']);  // Only if navbar2 is allowed for customers
          } else {
            this.router.navigate(['/unauthorized']);
          }
          
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.Loginfg.markAllAsTouched();
      this.errorMessage = 'Please enter both username and password.';
    }
  }
  
}
