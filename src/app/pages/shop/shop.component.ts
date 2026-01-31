import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FormsModule, RouterModule, DecimalPipe],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.products = this.productService.getAll();
    this.filteredProducts = this.products;
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products;
      return;
    }
    this.filteredProducts = this.productService.search(this.searchTerm);
  }

  addToCart(product: Product): void {
    this.cartService.add(product);
  }
}
