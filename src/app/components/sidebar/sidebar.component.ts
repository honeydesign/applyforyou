import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  user: any = null;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();
  }

  get initials(): string {
    if (!this.user) return 'U';
    return `${this.user.firstName?.[0] || ''}${this.user.lastName?.[0] || ''}`.toUpperCase();
  }

  get fullName(): string {
    if (!this.user) return 'User';
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  logout() {
    this.auth.logout();
  }
}