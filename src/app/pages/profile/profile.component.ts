import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgIf, FormsModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  firstName = '';
  lastName  = '';
  email     = '';
  phone     = '';
  location  = '';
  summary   = '';
  cvName    = '';
  cvDate    = '';
  loading   = true;
  saving    = false;
  success   = '';
  error     = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadProfile();
    this.loadCV();
  }

  loadProfile() {
    this.api.get<any>('/user').subscribe({
      next: (data) => {
        this.firstName = data.firstName || '';
        this.lastName  = data.lastName  || '';
        this.email     = data.email     || '';
        this.phone     = data.phone     || '';
        this.location  = data.location  || '';
        this.summary   = data.summary   || '';
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadCV() {
    this.api.get<any>('/cv').subscribe({
      next: (data) => {
        this.cvName = data.fileName || 'My CV';
        this.cvDate = `Uploaded ${new Date(data.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      },
      error: () => {}
    });
  }

  saveChanges() {
    this.saving  = true;
    this.success = '';
    this.error   = '';

    this.api.put<any>('/user', {
      firstName: this.firstName,
      lastName:  this.lastName,
      phone:     this.phone,
      location:  this.location,
      summary:   this.summary
    }).subscribe({
      next: () => {
        this.saving  = false;
        this.success = 'Profile saved successfully!';
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.saving = false;
        this.error  = 'Failed to save profile. Please try again.';
      }
    });
  }

  onCVTextChange(event: any) {
    const text = event.target.value;
    if (!text) return;
    this.api.post<any>('/cv', { rawText: text, fileName: 'Pasted CV' }).subscribe({
      next: () => {
        this.cvName = 'Pasted CV';
        this.cvDate = 'Just uploaded';
      },
      error: () => {}
    });
  }

  removeCV() {
    this.api.delete<any>('/cv').subscribe({
      next: () => { this.cvName = ''; this.cvDate = ''; },
      error: () => {}
    });
  }

  get initials(): string {
    return `${this.firstName[0] || ''}${this.lastName[0] || ''}`.toUpperCase();
  }
}