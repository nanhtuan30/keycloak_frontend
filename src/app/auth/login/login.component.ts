import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule  } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    loginForm: FormGroup = new FormGroup({});
  errorMessage: any;

constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
      this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
  if (this.loginForm.invalid) return;

  const loginData = this.loginForm.value;
  console.log('Attempting login with:', loginData);

  this.authService.login(this.loginForm.value).subscribe({
  next: (res) => 
  {
    this.router.navigate(['/home']),
    localStorage.setItem('access_token', res.access_token);

  },
  error: err => {
    console.error('Login failed:', err.message);
    this.errorMessage = err.message; // dùng để hiển thị lên UI
  }
});
}
}
