import { Component, ViewEncapsulation } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-applications',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, NgClass, FormsModule, SidebarComponent],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent {
  searchQuery = '';
  selectedStatus = '';
  selectedBoard = '';
  selectedDate = '';

  statuses = ['All statuses', 'Applied', 'Viewed', 'Interview', 'Not selected'];
  boards = ['All boards', 'LinkedIn', 'Jobberman', 'Indeed', 'MyJobMag', 'BrighterMonday'];
  dates = ['All time', 'Today', 'This week', 'This month'];

  applications = [
    { title: 'Software Engineer',  company: 'Flutterwave',  board: 'LinkedIn',       date: 'Today, 9:14am',  status: 'viewed'    },
    { title: 'Product Manager',    company: 'Paystack',     board: 'Jobberman',      date: 'Today, 8:52am',  status: 'interview' },
    { title: 'Frontend Developer', company: 'Andela',       board: 'Indeed',         date: 'Yesterday',      status: 'applied'   },
    { title: 'Data Analyst',       company: 'MTN Nigeria',  board: 'MyJobMag',       date: 'Yesterday',      status: 'applied'   },
    { title: 'UX Designer',        company: 'Konga',        board: 'BrighterMonday', date: '2 days ago',     status: 'rejected'  },
    { title: 'Backend Engineer',   company: 'Interswitch',  board: 'LinkedIn',       date: '2 days ago',     status: 'viewed'    },
    { title: 'Business Analyst',   company: 'Access Bank',  board: 'Jobberman',      date: '3 days ago',     status: 'applied'   },
    { title: 'DevOps Engineer',    company: 'Jumia',        board: 'Indeed',         date: '3 days ago',     status: 'interview' }
  ];

  stats = [
    { label: 'Total',        value: 142, color: '#7C3AED' },
    { label: 'Viewed',       value: 38,  color: '#1E40AF' },
    { label: 'Interviews',   value: 5,   color: '#065F46' },
    { label: 'Not selected', value: 12,  color: '#991B1B' },
    { label: 'Pending',      value: 87,  color: '#9CA3AF' }
  ];

  getStatusLabel(status: string): string {
    const map: any = {
      applied:   'Applied',
      viewed:    'Viewed',
      interview: 'Interview',
      rejected:  'Not selected'
    };
    return map[status] || status;
  }
}