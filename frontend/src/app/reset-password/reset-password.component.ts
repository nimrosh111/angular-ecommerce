import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]]
    });
    
  }
  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
  const token = this.route.snapshot.queryParamMap.get('token');
  

  
    if (email && token) {
      this.resetForm.patchValue({ email, token });
    }
 
}

onSubmit() {
  if (this.resetForm.valid) {
    this.http.post('http://localhost:5068/User/reset-password', this.resetForm.value)
      .subscribe({
        next: () => {
          this.successMessage = 'Password reset successfully. You can now log in.';
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error || 'Error resetting password.';
        }
      });
  } else {
    this.resetForm.markAllAsTouched();
  }
}
}
