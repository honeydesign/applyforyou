import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgFor, NgSwitch, NgSwitchCase, NgClass, NgIf } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, NgSwitch, NgSwitchCase, NgClass, NgIf, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user = this.auth.getUser();
  isPaused = false;
  loading = true;

  stats = [
    { label: 'Applications sent',  value: '—', sub: '',              icon: 'document' },
    { label: 'Applications viewed', value: '—', sub: '',             icon: 'eye'      },
    { label: 'Interview requests',  value: '—', sub: '',             icon: 'phone'    },
    { label: 'Response rate',       value: '—', sub: '',             icon: 'trending' }
  ];

  applications: any[] = [];

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    this.loadStats();
    this.loadApplications();
  }

  loadStats() {
    this.api.get<any>('/applications/stats').subscribe({
      next: (data) => {
        this.stats = [
          { label: 'Applications sent',   value: data.total.toString(),        sub: 'Total sent',       icon: 'document' },
          { label: 'Applications viewed', value: data.viewed.toString(),       sub: `${data.responseRate}% view rate`, icon: 'eye' },
          { label: 'Interview requests',  value: data.interview.toString(),    sub: 'This month',       icon: 'phone'    },
          { label: 'Response rate',       value: `${data.responseRate}%`,      sub: 'Overall',          icon: 'trending' }
        ];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadApplications() {
    this.api.get<any>('/applications?limit=5').subscribe({
      next: (data) => { this.applications = data.applications || []; },
      error: () => {}
    });
  }

  getStatusLabel(status: string): string {
    const map: any = {
      applied:   'Applied',
      viewed:    'Viewed',
      interview: 'Interview',
      rejected:  'Not selected'
    };
    return map[status] || status;
  }

  togglePause() { this.isPaused = !this.isPaused; }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  get firstName() { return this.user?.firstName || 'there'; }
}