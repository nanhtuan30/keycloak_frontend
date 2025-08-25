import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8081/api/auth';
  private tokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';

  // Lưu trạng thái đăng nhập
  private authState = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.authState.asObservable();

  login(data: LoginRequest): Observable<any> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, data, {
      headers: { noauth: 'noauth' } // giữ logic noauth nếu backend bạn bỏ check auth
    }).pipe(
      tap(res => {
        console.log('LOGIN RESPONSE:', res);
        if (res.access_token) {
          localStorage.setItem(this.tokenKey, res.access_token);
          if (res.refresh_token) {
            localStorage.setItem(this.refreshTokenKey, res.refresh_token);
          }
          this.authState.next(true);
        } else {
          throw new Error('Login failed: không nhận được access_token');
        }
      }),
      catchError(err => {
        const msg = err?.error?.message || 'Đăng nhập thất bại!';
        return throwError(() => new Error(msg));
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data, {
      headers: { noauth: 'noauth' }
    }).pipe(
      catchError(err => {
        const msg = err?.error?.message || 'Đăng ký thất bại!';
        return throwError(() => new Error(msg));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string {
    const token = this.getToken();
    if (!token || token.split('.').length !== 3) {
      return 'người dùng';
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.preferred_username || payload.email || 'người dùng';
    } catch (err) {
      console.warn('Token decode fail:', err);
      return 'người dùng';
    }
  }

  isLoggedIn(): boolean {
    return this.authState.value;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.authState.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}