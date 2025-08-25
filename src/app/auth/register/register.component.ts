import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormsModule, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
registerForm: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      phone: ['']
    });
  }

  register() {
    if (this.registerForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: res => console.log('Registration success', res),
      error: err => console.error('Registration error', err)
    });
  }
}