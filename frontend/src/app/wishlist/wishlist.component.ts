import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../Services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];

  constructor(private wishlistService: WishlistService) {}

  ngOnInit(): void {
    // Load from backend and sync UI
    this.wishlistService.loadWishlist();
    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(item: any): void {
    this.wishlistService.removeFromWishlist(item.productId);
    // No need to manually filter, the service's BehaviorSubject handles UI update
  }

  clearAllWishlist():void
{
  this.wishlistService.clearWishlist();
}

}
