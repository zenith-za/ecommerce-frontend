import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zarCurrency',
  standalone: true
})
export class ZarCurrencyPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null || value === undefined) {
      return 'R0.00';
    }
    
    // Format to 2 decimal places and prepend R symbol
    return `R${value.toFixed(2)}`;
  }
} 