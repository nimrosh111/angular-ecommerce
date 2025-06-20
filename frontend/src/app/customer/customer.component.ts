import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from '../Services/customer.service';
import { Customer } from '../Models/customer';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  Customerfg: FormGroup;
  isSubmitting = false;
  customerId: string = '';
  customerName: string = '';

  constructor(
    private fb: FormBuilder,
    private custservice: CustomerService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.Customerfg = this.fb.group({
      id: [''], // must include ID for PUT request
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      age: [''],
      identityUserId: ['']
    });
  }

  ngOnInit() {
    const tokenData = this.authService.getCustomerIdAndRole();
    console.log('Customer token data:', tokenData);
  
    if (!tokenData) {
      this.router.navigate(['/login']);
      return;
    }
  
    if (tokenData.role === 'Admin') {
      // Admin edits/deletes other customers via route param
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      if (idFromRoute) {
        this.customerId = idFromRoute;
        this.getCustomer(this.customerId);
      } else {
        alert('No customer ID provided in URL');
        this.router.navigate(['/navbar2']);
      }
    } else {
      // Customer only edits their own data
      this.customerId = tokenData.customerId;
      this.getCustomer(this.customerId);
    }
  }
  




  getCustomer(id: string) {
    this.custservice.getCustomerById(id).subscribe(
      (res: Customer) => {
        console.log('Fetched full customer data:', res);

        // Patch form with full customer data
        this.Customerfg.patchValue({
          id: res.id,
          identityUserId: res.identityUserId,
          name: res.name||'',
          email: res.email,
          username: res.username,
          phone: res.phone||'',
          age: res.age||''
        });

        // Optionally update localStorage
        localStorage.setItem('registeredUser', JSON.stringify(res));
        this.customerName=res.username;
        console.log('IdentityUserId:', res.identityUserId);
        

      },
      (err) => {
        console.error('Failed to fetch customer:', err);
        alert('Failed to load customer data.');
      }
    );
  }

 onSubmit(): void {
  if (this.Customerfg.invalid) {
    alert('Form has validation errors.');
    return;
  }

  const customerData: Customer = {
    ...this.Customerfg.value,
    id: this.customerId // ensure correct ID used
  };

  console.log('Sending customer update:', customerData);

  this.isSubmitting = true;
  this.Customerfg.disable();

  this.custservice.updateCustomer(customerData).subscribe({
    next: (res) => {
      this.isSubmitting = false;
      this.Customerfg.enable();
      alert('Customer updated successfully.');
      this.router.navigate(['/navbar2']);
    },
    error: (err) => {
      this.isSubmitting = false;
      this.Customerfg.enable();
      console.error('Update error:', err);
      alert('Update failed: ' + (err.error?.message || 'Server error'));
    }
  });
}



  DeleteCustomer(): void {
    if (!this.customerId || !confirm('Are you sure you want to delete this customer?')) return;

    this.custservice.deleteCustomer(this.customerId).subscribe({
      next: () => {
        alert('Customer deleted successfully.');
        localStorage.removeItem('registeredUser');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer.');
      }
    });
  }
}
