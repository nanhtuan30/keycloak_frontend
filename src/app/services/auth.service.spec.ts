import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
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

  it('should save token on login', () => {
    const mockResponse = { token: 'mock-jwt-token' };

    service.login({ username: 'test', password: '1234' }).subscribe();
    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    req.flush(mockResponse);

    expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
  });

  it('should clear token on logout', () => {
    localStorage.setItem('authToken', 'mock-jwt-token');
    service.logout();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
