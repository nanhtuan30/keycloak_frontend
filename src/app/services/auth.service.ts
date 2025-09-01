import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
  };
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private tokenKey = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }

    console.error('AuthService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        let token =
          response.data?.token ||
          response.data?.accessToken ||
          response.data?.access_token ||
          response.token ||
          response.accessToken ||
          response.access_token;

        if (token) {
          this.saveToken(token);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/home']);
        } else {
          throw new Error('No authentication token received from server');
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /** Lấy thông tin user từ token */
  getProfile(): Observable<UserProfile | { data: UserProfile }> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No access token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/profile`, { headers }).pipe(
      map(res => res),
      catchError(err => {
        console.error('Profile error:', err);
        return throwError(() => err);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
