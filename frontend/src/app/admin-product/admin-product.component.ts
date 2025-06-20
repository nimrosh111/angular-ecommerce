import { Component, OnInit } from '@angular/core';
import { ProductService } from '../Services/product.service';
import { Product } from '../Models/Product';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.css']
})
export class AdminProductComponent implements OnInit {

  productList: Product[] = [];
  editingProduct: Product | null = null;  // currently editing product or null
  newProduct: Product = this.getEmptyProduct();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProduct().subscribe({
      next: products => this.productList = products,
      error: err => alert('Error loading products: ' + err)
    });
  }

  getEmptyProduct(): Product {
    return {
      title: '',
      price: 1, // default valid value
      description: '',
      category: '',
      image: '',
      quantity: 1,
      total: 1
    };
  }
  

  startEdit(product: Product) {
    // create a copy to edit, so we don't mutate original until saved
    this.editingProduct = { ...product };
  }

  cancelEdit() {
    this.editingProduct = null;
  }

  saveEdit() {
    if (!this.editingProduct || this.editingProduct.id === undefined) return;

    this.productService.updateProduct(this.editingProduct.id, this.editingProduct).subscribe({
      next: updated => {
        // update productList with updated product
        const index = this.productList.findIndex(p => p.id === updated.product.id);
        if (index !== -1) this.productList[index] = updated.product;
        alert('Product updated successfully');
        this.editingProduct = null;
      },
      error: err => alert('Error updating product: ' + err)
    });
  }

  deleteProduct(id?: number) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.productList = this.productList.filter(p => p.id !== id);
        alert('Product deleted successfully');
      },
      error: err => alert('Error deleting product: ' + err)
    });
  }

  addProduct() {
    this.newProduct.total = this.newProduct.price * this.newProduct.quantity;
  
    console.log('Adding product:', this.newProduct); // ✅ log it before sending
  
    this.productService.addProduct(this.newProduct).subscribe({
      next: addedProduct => {
        this.productList.push(addedProduct);
        alert('Product added successfully');
        this.newProduct = this.getEmptyProduct(); // reset form
      },
      error: err => {
        console.error('Error adding product:', err); // log full error
        alert('Error adding product: ' + err.error); // shows backend message
      }
    });
  }
  
}
