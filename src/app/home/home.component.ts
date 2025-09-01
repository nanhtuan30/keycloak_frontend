import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  profile: UserProfile | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if ('data' in response && response.data) {
            this.profile = response.data;
          } else {
            this.profile = response as UserProfile;
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.message || 'Failed to load profile';
          if (error.status === 401) {
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        }
      });
  }

  getDisplayName(): string {
    if (!this.profile) return '';

    const firstName = this.profile.firstName || '';
    const lastName = this.profile.lastName || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return this.profile.username;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
