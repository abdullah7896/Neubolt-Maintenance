import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ComplaintsService } from 'src/app/services/complaints.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private complaintsService: ComplaintsService,
    private router: Router
  ) {}

  // 🔹 Redirect if already logged in
  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/dashboard/default']);
    }
  }

  // 🔹 Handle Login
  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // 🔹 Call API using ComplaintsService
    this.complaintsService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login Successful:', response);

        // Adjust according to your backend response key
        const token = response?.token || response?.access_token;

        if (token) {
          localStorage.setItem('access_token', token);
          this.router.navigate(['/dashboard/default']);
        } else {
          this.errorMessage = 'Invalid server response: no token received.';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Login Failed:', err);
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Invalid username or password.';
      }
    });
  }
}
