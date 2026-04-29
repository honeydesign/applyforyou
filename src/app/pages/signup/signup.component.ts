import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, NgIf, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  firstName  = '';
  lastName   = '';
  email      = '';
  password   = '';
  showPassword = false;
  loading    = false;
  error      = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSignup() {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.error   = '';

    this.auth.signup({
      firstName: this.firstName,
      lastName:  this.lastName,
      email:     this.email,
      password:  this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/onboarding']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Signup failed. Please try again.';
      }
    });
  }
}