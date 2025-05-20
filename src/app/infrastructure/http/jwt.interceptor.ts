import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpHeaders
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { ApiService } from './api.service';

// Modern approach for standalone Angular apps
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const apiService = inject(ApiService);
  
  // Skip adding auth header for login & register requests
  if (req.url.includes('login') || req.url.includes('register')) {
    return next(req);
  }

  // Get the token
  const token = apiService.getToken();
  
  // If token exists, clone the request and add the Authorization header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    
    return next(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Handle token refresh here
          const refreshHeaders = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          });
          
          return apiService.post('refresh', {}, refreshHeaders).pipe(
            switchMap((response: any) => {
              apiService.setToken(response.token);
              
              // Use the new token for the original request
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`,
                  Accept: 'application/json'
                }
              });
              
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              apiService.setToken('');
              return throwError(() => refreshError);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
  
  // For non-authenticated requests that don't need authorization
  const acceptJsonReq = req.clone({
    setHeaders: {
      Accept: 'application/json'
    }
  });
  return next(acceptJsonReq);
};

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private apiService: ApiService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding auth header for login & register requests
    if (request.url.includes('login') || request.url.includes('register')) {
      return next.handle(request);
    }

    // Try to get the token
    const token = this.apiService.getToken();
    
    // If token exists, clone the request and add the Authorization header
    if (token) {
      request = this.addToken(request, token);
    }

    // Handle the request and catch any errors
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = this.apiService.getToken();
      const refreshHeaders = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      });

      // Attempt to refresh the token
      return this.apiService.post('refresh', {}, refreshHeaders).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.apiService.setToken(response.token);
          this.refreshTokenSubject.next(response.token);
          return next.handle(this.addToken(request, response.token));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.apiService.setToken('');
          // Redirect to login page or dispatch a logout action
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token)))
      );
    }
  }
} 