import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../infrastructure/http/api.service';
import { Product } from '../../domain/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductUseCase {
  constructor(private apiService: ApiService) {}

  getProducts(categoryId?: number): Observable<Product[]> {
    const endpoint = categoryId ? `products?category_id=${categoryId}` : 'products';
    return this.apiService.get(endpoint);
  }

  getProduct(id: number): Observable<Product> {
    return this.apiService.get(`products/${id}`);
  }

  createProduct(data: FormData): Observable<Product> {
    return this.apiService.post('products', data);
  }

  updateProduct(id: number, data: FormData): Observable<Product> {
    return this.apiService.put(`products/${id}`, data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.apiService.delete(`products/${id}`);
  }
}