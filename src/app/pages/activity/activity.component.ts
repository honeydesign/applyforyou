import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, NgIf, NgClass, SidebarComponent],
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {
  applications:  any[] = [];
  notifications: any[] = [];
  loading        = true;
  selectedApp:   any   = null;
  activeTab      = 'applications';

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadActivity(); }

  loadActivity() {
    this.loading = true;
    this.api.get<any>('/applications?limit=50').subscribe({
      next: (data) => {
        this.applications = data.applications || [];
        this.loading      = false;
      },
      error: () => { this.loading = false; }
    });

    this.api.get<any[]>('/notifications').subscribe({
      next: (data) => { this.notifications = data || []; },
      error: () => {}
    });
  }

  selectApp(app: any) {
    this.selectedApp = this.selectedApp?.id === app.id ? null : app;
  }

  getStatusLabel(status: string): string {
    const map: any = { applied: 'Applied', viewed: 'Viewed', interview: 'Interview', rejected: 'Not selected' };
    return map[status] || status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getScoreColor(score: number): string {
    if (score >= 85) return '#065F46';
    if (score >= 70) return '#1E40AF';
    return '#7C3AED';
  }

  getScoreBg(score: number): string {
    if (score >= 85) return '#D1FAE5';
    if (score >= 70) return '#DBEAFE';
    return '#EDE9FE';
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}