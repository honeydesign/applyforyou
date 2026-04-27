import { Component, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, FormsModule, SidebarComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  email = 'chidi@email.com';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

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

  toggle(item: any)   { item.active = !item.active; }
  saveSettings()      { console.log('Settings saved'); }
  pauseAccount()      { console.log('Account paused'); }
  deleteAccount()     { console.log('Account deleted'); }
}