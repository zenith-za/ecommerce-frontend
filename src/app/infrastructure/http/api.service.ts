import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api';
  private token: string | null = null;

  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setToken(token: string): void {
    this.token = token;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('jwt_token');
    }
    return this.token;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      Accept: 'application/json'
    });
  }

  get<T>(endpoint: string, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.getHeaders();
    return this.httpClient.get<T>(`${this.baseUrl}/${endpoint}`, { headers });
  }

  post<T>(endpoint: string, data: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.getHeaders();
    return this.httpClient.post<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  put<T>(endpoint: string, data: any, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.getHeaders();
    return this.httpClient.put<T>(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  delete<T>(endpoint: string, customHeaders?: HttpHeaders): Observable<T> {
    const headers = customHeaders || this.getHeaders();
    return this.httpClient.delete<T>(`${this.baseUrl}/${endpoint}`, { headers });
  }
}