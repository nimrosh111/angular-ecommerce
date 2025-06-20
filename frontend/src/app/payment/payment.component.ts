import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../Services/cart.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  orderItems: any[] = [];
  grandTotal: number = 0;
  selectedPayment: string = '';

 

  constructor(
    private router: Router,
    private cartService: CartService,
    private http: HttpClient
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;
    this.orderItems = state?.['orderItems'] || [];
    this.grandTotal = state?.['grandtotal'] || 0;
  }

  ngOnInit(): void {
    if (!this.orderItems.length) {
      alert("No order items found.");
      this.router.navigate(['/navbar2']);
    }
  }

  confirmPayment() {
    if (!this.selectedPayment) {
      alert('Please select a payment method.');
      return;
    }
  
    const customerId = localStorage.getItem('customerId');
    if (!customerId) {
      alert('User not logged in');
      this.router.navigate(['/navbar2']);
      return;
    }
  
    const orderSummary = {
      customerId: customerId,
      products: this.orderItems.map(item => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        total: item.total
      })),
      grandTotal: this.grandTotal,
      paymentMethod: this.selectedPayment
    };
  
    this.http.post('http://localhost:5068/api/OrderSummary/save-summary', orderSummary, {
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        alert('Order placed successfully!');
        this.cartService.removeAllCart();
        localStorage.removeItem('orderProducts');
        localStorage.removeItem('grandTotal');
        this.router.navigate(['/navbar2']);
      },
      error: (err) => {
        console.error('Error placing order:', err);
        alert('Failed to place order.');
      }
    });
  }
  
}
