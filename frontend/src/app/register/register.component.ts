import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  Registerfg: FormGroup | any;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.Registerfg = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
      ]],
     

    });
  }

  ngOnInit() { }


  onSubmit() {
    if (this.Registerfg.valid) {
      const formData = {
        ...this.Registerfg.value,
        role: 'Customer'  // ✅ Always assign "Customer"
      };
  
      const apiUrl = 'http://localhost:5068/User/register';
  
      this.http.post(apiUrl, formData).subscribe({
        next: (res: any) => {
          console.log('Registration successful, response:', res);
          localStorage.setItem('registeredUser', JSON.stringify(res.customer));
          this.successMessage = 'Registration successful!';
          this.router.navigate(['/login']); // ✅ Always go to login
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.errorMessage = err.error?.message || err.error || 'Registration failed. Try again.';
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.Registerfg.markAllAsTouched();
    }
  }
  
    

}


