import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../Services/cart.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  products: any[] = [];
  grandTotal: number = 0;

  constructor(private router: Router,private cartService: CartService,
    private http: HttpClient) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    this.products = state?.['orderItems'] || [];
    this.grandTotal = state?.['grandtotal'] || 0;
  }

  ngOnInit(): void {
    if (!this.products.length) {
      alert("No order data found.");
      this.router.navigate(['/navbar2']);
    }
  }

  buyNow() {
    if (!this.products.length) {
      alert("Cart is empty.");
      return;
    }

    this.router.navigate(['/payment'], {
      state: {
        orderItems: this.products,
        grandtotal: this.grandTotal
      }
    });
  }

}
