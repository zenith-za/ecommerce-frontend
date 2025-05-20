import { Pipe, PipeTransform } from '@angular/core';

// API base URL - update this when deploying to production
const API_BASE_URL = 'http://127.0.0.1:8000';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(imagePath: string | null): string {
    // If no image path is provided
    if (!imagePath) {
      return 'assets/images/placeholder.png';
    }
    
    // If image is already a full URL, return it directly
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Handle Laravel storage paths
    if (imagePath.includes('storage/')) {
      // If the image path includes 'storage/', it's a Laravel storage path
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      
      return `${API_BASE_URL}${normalizedPath}`;
    }

    // Default case - just prepend the API URL
    return `${API_BASE_URL}/storage/${imagePath}`;
  }
} 