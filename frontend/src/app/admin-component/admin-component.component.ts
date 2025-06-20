import { Component, OnInit } from '@angular/core';
import { Customer } from '../Models/customer';
import { CustomerService } from '../Services/customer.service';

@Component({
  selector: 'app-admin-component',
  templateUrl: './admin-component.component.html',
  styleUrls: ['./admin-component.component.css']
})
export class AdminComponentComponent implements OnInit {
  customers: Customer[] = [];
  activeSection: 'customer' | 'product' = 'customer';

  showModal: boolean = false;
  selectedCustomer: Customer = {
    id: undefined,        // use undefined, NOT ''
    name: '',
    email: '',
    username: '',
    phone: '',
    age: '',
    identityUserId: ''
  };

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  showSection(section: 'customer' | 'product') {
    this.activeSection = section;
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.customers = res;
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        alert('Error fetching customers.');
      }
    });
  }

  openModal(customer: Customer) {
    // Deep clone to prevent direct editing until saved
    this.selectedCustomer = { ...customer };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCustomer() {
    if (this.selectedCustomer.id === undefined) {
      alert('Invalid customer ID.');
      return;
    }

    this.customerService.updateCustomer(this.selectedCustomer).subscribe({
      next: (res) => {
        const index = this.customers.findIndex(c => c.id === res.id);
        if (index !== -1) this.customers[index] = res;

        this.closeModal();
        alert('Customer updated successfully.');
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update customer.');
      }
    });
  }

  deleteCustomer(id: string | undefined): void {
    if (!id) return;






    if (!confirm('Are you sure you want to delete this customer?')) return;

    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        if (!id) return;
        this.customers = this.customers.filter(c => c.id !== id);

        alert('Customer deleted successfully.');
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete customer.');
      }
    });
  }

}
