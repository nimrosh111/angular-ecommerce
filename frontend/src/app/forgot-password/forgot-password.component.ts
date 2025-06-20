import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  message: string = '';
  error: string = '';
  token: string = '';
email: string = '';


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.http.post('http://localhost:5068/User/forgot-password', this.forgotForm.value)
      .subscribe({
        next: (res: any) => {
          this.token = res.token;
          this.email = this.forgotForm.value.email;
          this.message = 'Reset token generated. Use the link below to reset password.';
          this.error = '';
        },
        error: (err) => {
          this.error = err.error || 'Something went wrong.';
          this.message = '';
        }
      });
    }
  }    
}
