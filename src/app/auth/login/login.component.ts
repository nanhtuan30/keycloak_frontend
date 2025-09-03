import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string | null = null;
  loading = false;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.successMessage = 'Đăng ký thành công! Vui lòng đăng nhập.';
        setTimeout(() => this.successMessage = null, 5000);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.error = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.loading = true;
    this.error = null;

    const credentials = this.loginForm.value;
    console.log('Credentials sent:', credentials); // Debug
    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
  console.error('Full login error:', err);
  
  // Hiển thị thông tin lỗi chi tiết
  if (err.error) {
    this.error = err.error.message || err.error.error_description || err.message;
  } else {
    this.error = err.message || 'Đăng nhập thất bại';
  }
  
  // Log thêm để debug
  console.log('Error status:', err.status);
  console.log('Error headers:', err.headers);
      }
    });
  }
}