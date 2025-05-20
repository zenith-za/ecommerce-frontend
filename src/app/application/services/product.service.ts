import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductUseCase } from '../use-cases/product.service';
import { Product } from '../../domain/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private productUseCase: ProductUseCase) {}

  getProducts(categoryId?: number): Observable<Product[]> {
    return this.productUseCase.getProducts(categoryId);
  }

  getProduct(id: number): Observable<Product> {
    return this.productUseCase.getProduct(id);
  }

  createProduct(data: FormData): Observable<Product> {
    return this.productUseCase.createProduct(data);
  }

  updateProduct(id: number, data: FormData): Observable<Product> {
    return this.productUseCase.updateProduct(id, data);
  }

  deleteProduct(id: number): Observable<void> {
    return this.productUseCase.deleteProduct(id);
  }
}