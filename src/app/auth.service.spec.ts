import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/api/auth'; // Đổi nếu backend port khác

  constructor(private http: HttpClient) {}

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  register(data: {
    username: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }
}
