import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save tokens on login', () => {
    const mockResponse: LoginResponse = {
      access_token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: {
        sub: 'mock-sub',
        username: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    };

    service.login({ username: 'test', password: '1234' }).subscribe();
    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
    expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
  });

  it('should refresh token', () => {
    const mockResponse: LoginResponse = {
      access_token: 'new-jwt-token',
      refresh_token: 'new-refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: {
        sub: 'mock-sub',
        username: 'test',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    };

    localStorage.setItem('refreshToken', 'mock-refresh-token');
    service.refreshToken().subscribe();
    const req = httpMock.expectOne('http://localhost:8081/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(localStorage.getItem('authToken')).toBe('new-jwt-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
  });

  it('should call logout endpoint and clear tokens', () => {
    localStorage.setItem('authToken', 'mock-jwt-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    
    service.logout();
    const req = httpMock.expectOne('http://localhost:8081/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'Logout successful', data: null, error: null });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('should handle login error', () => {
    service.login({ username: 'test', password: 'wrong' }).subscribe({
      error: (err) => {
        expect(err.message).toContain('Invalid credentials');
      }
    });

    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
  });
});