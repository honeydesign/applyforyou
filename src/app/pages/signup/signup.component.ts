import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, NgIf, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}