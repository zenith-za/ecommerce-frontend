import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../application/services/product.service';
import { ApiService } from '../../infrastructure/http/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { Product } from '../../domain/models/product.model';
import { Category } from '../../domain/models/category.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { ImageUrlPipe } from '../../infrastructure/pipes/image-url.pipe';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageCropperComponent, ImageUrlPipe],
  templateUrl: './admin-view.component.html',
})
export class AdminViewComponent implements OnInit {
  products: Product[] = [];
  newProduct = { name: '', description: '', price: 0, image: null as File | null, category_id: 0 };
  categories: Category[] = [];
  editingProduct: Product | null = null;
  editForm = { name: '', description: '', price: 0, image: null as File | null, category_id: 0 };
  
  // Image cropper properties
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  isEditMode = false;

  constructor(
    private productService: ProductService,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(categoryId?: number): void {
    this.productService.getProducts(categoryId).subscribe({
      next: (products) => (this.products = products),
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to load products. Please try again.' },
        });
      },
    });
  }

  loadCategories(): void {
    this.apiService.get<Category[]>('categories').subscribe({
      next: (categories) => (this.categories = categories),
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to load categories. Please try again.' },
        });
      },
    });
  }

  onFileChange(event: any, isEdit: boolean = false): void {
    this.isEditMode = isEdit;
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob;
    
    // Convert blob to file
    if (this.croppedImage) {
      const fileName = this.imageChangedEvent.target.files[0].name;
      const fileType = this.imageChangedEvent.target.files[0].type;
      
      const file = new File([this.croppedImage], fileName, { 
        type: fileType,
        lastModified: new Date().getTime()
      });
      
      if (this.isEditMode) {
        this.editForm.image = file;
      } else {
        this.newProduct.image = file;
      }
    }
  }
  
  imageLoaded() {
    this.showCropper = true;
  }
  
  loadImageFailed() {
    this.dialog.open(AlertDialogComponent, {
      data: { message: 'Failed to load image. Please try another file.' },
    });
  }
  
  cancelCropping() {
    this.showCropper = false;
    this.imageChangedEvent = null;
  }
  
  applyCropping() {
    this.showCropper = false;
    this.dialog.open(AlertDialogComponent, {
      data: { message: 'Image cropped successfully!' },
    });
  }

  createProduct(): void {
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('price', this.newProduct.price.toString());
    if (this.newProduct.image) {
      formData.append('image', this.newProduct.image);
    }
    formData.append('category_id', this.newProduct.category_id.toString());

    this.productService.createProduct(formData).subscribe({
      next: (product) => {
        this.products.push(product);
        this.resetForm();
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Product created successfully!' },
        });
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to create product. Please try again.' },
        });
      },
    });
  }

  editProduct(product: Product): void {
    this.editingProduct = { ...product };
    this.editForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      image: null,
      category_id: product.category_id,
    };
  }

  updateProduct(): void {
    if (!this.editingProduct) return;
    
    const formData = new FormData();
    formData.append('name', this.editForm.name);
    formData.append('description', this.editForm.description);
    formData.append('price', this.editForm.price.toString());
    if (this.editForm.image) {
      formData.append('image', this.editForm.image);
    }
    formData.append('category_id', this.editForm.category_id.toString());

    this.productService.updateProduct(this.editingProduct.id, formData).subscribe({
      next: (updated) => {
        const index = this.products.findIndex((p) => p.id === updated.id);
        this.products[index] = updated;
        this.editingProduct = null;
        this.resetForm();
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Product updated successfully!' },
        });
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to update product. Please try again.' },
        });
      },
    });
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== id);
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Product deleted successfully!' },
        });
      },
      error: () => {
        this.dialog.open(AlertDialogComponent, {
          data: { message: 'Failed to delete product. Please try again.' },
        });
      },
    });
  }

  resetForm(): void {
    this.newProduct = { name: '', description: '', price: 0, image: null, category_id: 0 };
    this.editForm = { name: '', description: '', price: 0, image: null, category_id: 0 };
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }
}