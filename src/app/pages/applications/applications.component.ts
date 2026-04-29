import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, NgClass, NgIf, FormsModule, SidebarComponent],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  searchQuery    = '';
  selectedStatus = '';
  selectedBoard  = '';
  selectedDate   = '';
  loading        = true;
  currentPage    = 1;
  totalPages     = 1;
  total          = 0;

  statuses = ['All statuses', 'Applied', 'Viewed', 'Interview', 'Not selected'];
  boards   = ['All boards', 'LinkedIn', 'Jobberman', 'Indeed', 'MyJobMag', 'BrighterMonday'];
  dates    = ['All time', 'Today', 'This week', 'This month'];

  applications: any[] = [];

  stats = [
    { label: 'Total',        value: 0, color: '#7C3AED' },
    { label: 'Viewed',       value: 0, color: '#1E40AF' },
    { label: 'Interviews',   value: 0, color: '#065F46' },
    { label: 'Not selected', value: 0, color: '#991B1B' },
    { label: 'Pending',      value: 0, color: '#9CA3AF' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
    this.loadApplications();
  }

  loadStats() {
    this.api.get<any>('/applications/stats').subscribe({
      next: (data) => {
        this.stats = [
          { label: 'Total',        value: data.total,     color: '#7C3AED' },
          { label: 'Viewed',       value: data.viewed,    color: '#1E40AF' },
          { label: 'Interviews',   value: data.interview, color: '#065F46' },
          { label: 'Not selected', value: data.rejected,  color: '#991B1B' },
          { label: 'Pending',      value: data.pending,   color: '#9CA3AF' }
        ];
        this.total = data.total;
      },
      error: () => {}
    });
  }

  loadApplications() {
    this.loading = true;
    const params = new URLSearchParams();
    params.set('page',  this.currentPage.toString());
    params.set('limit', '10');
    if (this.selectedStatus && this.selectedStatus !== 'All statuses') params.set('status', this.selectedStatus);
    if (this.selectedBoard  && this.selectedBoard  !== 'All boards')   params.set('board',  this.selectedBoard);

    this.api.get<any>(`/applications?${params.toString()}`).subscribe({
      next: (data) => {
        this.applications = data.applications || [];
        this.totalPages   = Math.ceil(data.total / 10);
        this.loading      = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadApplications();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadApplications();
  }

  getStatusLabel(status: string): string {
    const map: any = { applied: 'Applied', viewed: 'Viewed', interview: 'Interview', rejected: 'Not selected' };
    return map[status] || status;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}