import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, FormsModule, SidebarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  email           = '';
  currentPassword = '';
  newPassword     = '';
  confirmPassword = '';
  saving          = false;
  success         = '';
  error           = '';

  notifications = [
    { label: 'Application sent',   desc: 'Email when we apply to a new job',            active: true  },
    { label: 'Application viewed', desc: 'Email when an employer views your CV',        active: true  },
    { label: 'Interview request',  desc: 'Email when a company wants to interview you', active: true  },
    { label: 'Weekly summary',     desc: 'Weekly digest of your application activity',  active: true  },
    { label: 'Job not selected',   desc: 'Email when an application is unsuccessful',   active: false }
  ];

  aiSettings = [
    { label: 'Auto-apply to new jobs',       desc: 'Apply within 15 minutes of a job posting',              active: true  },
    { label: 'Generate cover letters',        desc: 'Include a tailored cover letter with each application', active: true  },
    { label: 'Apply to international roles',  desc: 'Include jobs outside your selected country',            active: false }
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) this.email = user.email;
  }

  toggle(item: any) { item.active = !item.active; }

  saveSettings() {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    this.saving  = true;
    this.success = '';
    this.error   = '';

    this.api.put<any>('/user', { email: this.email }).subscribe({
      next: () => {
        this.saving          = false;
        this.success         = 'Settings saved successfully!';
        this.currentPassword = '';
        this.newPassword     = '';
        this.confirmPassword = '';
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.saving = false;
        this.error  = 'Failed to save settings. Please try again.';
      }
    });
  }

  pauseAccount() {
    this.api.put<any>('/preferences', { isActive: false }).subscribe({
      next: () => { this.success = 'Applications paused successfully.'; },
      error: () => { this.error  = 'Failed to pause applications.'; }
    });
  }

  deleteAccount() {
    if (confirm('Are you sure? This will permanently delete your account and all data.')) {
      console.log('Delete account requested');
    }
  }
}