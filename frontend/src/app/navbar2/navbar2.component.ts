import { Component,OnInit } from '@angular/core';
import { CartService } from '../Services/cart.service';
import { ProductService } from '../Services/product.service';
import { WishlistService } from '../Services/wishlist.service';
import { AuthService } from '../Services/auth.service';

@Component({
  selector: 'app-navbar2',
  templateUrl: './navbar2.component.html',
  styleUrls: ['./navbar2.component.css']
})
export class Navbar2Component implements OnInit {

  public totalItem: number = 0;
  public searchTerm: string = '';
  wishlistCount: number = 0;
  userRoles: string[] = [];


  constructor(private cartService:CartService, private authService: AuthService, private productService:ProductService,private wishlistService:WishlistService){}

  ngOnInit() {
    
    this.userRoles = this.authService.getUserRoles();

    this.cartService.loadCartFromDB();

    this.cartService.getProducts().subscribe(res => {
      this.totalItem = res.length;
    });

    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }
  
 
   

  onSearchChange() {
    this.productService.search.next(this.searchTerm);
  }
}
