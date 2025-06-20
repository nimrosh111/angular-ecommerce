import { Component, OnInit } from '@angular/core';
import { ProductService } from '../Services/product.service';
import { CartService } from '../Services/cart.service';
import { WishlistService } from '../Services/wishlist.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  public productList: any[] = [];  // Initialize productList as an empty array
  public filteredProducts: any[] = [];  // Initialize filteredProducts as an empty array
  public searchTerm: string = '';  // Initialize search term

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit() {
    // Fetch products from the service
    this.productService.getProduct().subscribe(res => {
      this.productList = res;  // Assign the fetched products to productList
      this.filteredProducts = res;  // Initially, filteredProducts will be the same as productList
    });

    // Listen for search term changes
    this.productService.search.subscribe(searchValue => {
      this.searchTerm = searchValue;
      this.filterProducts(searchValue);  // Apply filter when search term changes
    });
  }

  // Filter products based on the search term
  filterProducts(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.filteredProducts = this.productList;  // Show all products if search term is empty
    } else {
      this.filteredProducts = this.productList.filter(product => 
        (product.title && typeof product.title === 'string' && product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && typeof product.description === 'string' && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  }

  // Add product to cart
  addToCart(product: any) {
    // Normalize and validate the product before sending to CartService
    const normalizedProduct = {
      ...product,
      productId: product.id || product.productId,  // Normalize productId
      quantity: product.quantity ?? 1,             // Set default quantity
      total: (product.price ?? 0) * (product.quantity ?? 1), // Calculate total
    };
  
    // Optional: Validate required fields before proceeding
    if (!normalizedProduct.productId || !normalizedProduct.price) {
      console.error('Invalid product data:', normalizedProduct);
      alert('Cannot add to cart. Product information is incomplete.');
      return;
    }
  
    this.cartService.addToCart(normalizedProduct);
    alert('Product added to your cart!');
  }
  

  // Add product to wishlist
  addToWishlist(product: any) {
    this.wishlistService.addToWishlist(product);
    alert('Product added to your wishlist!');
  }

  // Admin: Add a new product
  addProduct() {
    const newProduct = {
      title: 'New Product',
      price: 100,
      description: 'A new product description',
      category: 'Electronics',
      image: 'image-url',
      quantity: 1,
      total: 100
    };

    this.productService.addProduct(newProduct).subscribe(
      res => {
        console.log('Product added:', res);
        alert('New product added!');
        this.productList.push(res);  // Add the new product to the list
        this.filterProducts(this.searchTerm);  // Refactor filtered products based on search
      },
      err => {
        console.error('Error adding product:', err);
        alert('Error adding product.');
      }
    );
  }

  // Admin: Update product details
  updateProduct(product: any) {
    const updatedProduct = { ...product, price: product.price + 10 };  // Just an example update

    this.productService.updateProduct(product.id, updatedProduct).subscribe(
      res => {
        console.log('Product updated:', res);
        alert('Product updated!');
      },
      err => {
        console.error('Error updating product:', err);
        alert('Error updating product.');
      }
    );
  }

  // Admin: Delete product
  deleteProduct(productId: number) {
    this.productService.deleteProduct(productId).subscribe(
      res => {
        console.log('Product deleted:', res);
        this.productList = this.productList.filter(product => product.id !== productId);
        this.filterProducts(this.searchTerm);  // Refactor filtered products
        alert('Product deleted!');
      },
      err => {
        console.error('Error deleting product:', err);
        alert('Error deleting product.');
      }
    );
  }
}
