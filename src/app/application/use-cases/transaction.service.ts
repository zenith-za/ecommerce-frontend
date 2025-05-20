import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../infrastructure/http/api.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionUseCase {
  constructor(private apiService: ApiService) {}

  createTransaction(): Observable<any> {
    return this.apiService.post('transactions', {});
  }

  getTransactions(): Observable<any[]> {
    return this.apiService.get('transactions');
  }
}