import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    user: {
      sub: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
    };
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
  sub: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Full error object:', error); // DEBUG
    console.log('Error response body:', error.error); // DEBUG
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || `Mã lỗi: ${error.status}`;
    }
    console.error('AuthService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
    tap(response => {
      console.log('Raw login response:', response); // DEBUG
      
      if (response.success && response.data?.access_token) {
        this.saveToken(response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem(this.refreshTokenKey, response.data.refresh_token);
        }
        this.isAuthenticatedSubject.next(true);
        this.router.navigate(['/home']);
      } else {
        throw new Error(response.message || 'Không nhận được token từ server');
      }
    }),
    catchError(this.handleError.bind(this))
  );
}

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap(() => {
        this.router.navigate(['/login']);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  refreshToken(): Observable<LoginResponse> {
  const refreshToken = localStorage.getItem(this.refreshTokenKey);
  if (!refreshToken) {
    this.logout();
    return throwError(() => new Error('Không tìm thấy refresh token'));
  }

  return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
    tap(response => {
      if (response.success && response.data?.access_token) {
        this.saveToken(response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem(this.refreshTokenKey, response.data.refresh_token);
        }
        this.isAuthenticatedSubject.next(true);
      } else {
        throw new Error(response.message || 'Không nhận được token mới');
      }
    }),
    catchError(err => {
      this.logout();
      return throwError(() => err);
    })
  );
}

  logout(): void {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (refreshToken) {
      this.http
        .post(`${this.apiUrl}/logout`, { refreshToken })
        .subscribe({
          next: () => console.log('Logout successful'),
          error: err => console.error('Logout failed:', err)
        });
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getProfile(): Observable<UserProfile> {
  const token = this.getToken();
  if (!token) {
    return throwError(() => new Error('Không tìm thấy token'));
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/profile`, { headers }).pipe(
    map(response => {
      // Kiểm tra xem response có cấu trúc {success, message, data} không
      if (response.success && response.data) {
        return response.data;
      }
      return response; // Fallback nếu response không có wrapper
    }),
    catchError(err => {
      console.error('Lỗi lấy profile:', err);
      return throwError(() => err);
    })
  );
}

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}