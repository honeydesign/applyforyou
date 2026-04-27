import { Component, ViewEncapsulation } from '@angular/core';
import { NgFor, NgSwitch, NgSwitchCase, NgClass, NgIf } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, NgSwitch, NgSwitchCase, NgClass, NgIf, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  stats = [
    { label: 'Applications sent',  value: '142', sub: '+18 this week',  icon: 'document' },
    { label: 'Applications viewed', value: '38',  sub: '27% view rate', icon: 'eye'      },
    { label: 'Interview requests',  value: '5',   sub: '3 this week',   icon: 'phone'    },
    { label: 'Response rate',       value: '12%', sub: 'Above average', icon: 'trending' }
  ];

  applications = [
    { title: 'Software Engineer',  company: 'Flutterwave',  board: 'LinkedIn',       date: 'Today, 9:14am', status: 'viewed'    },
    { title: 'Product Manager',    company: 'Paystack',     board: 'Jobberman',      date: 'Today, 8:52am', status: 'interview' },
    { title: 'Frontend Developer', company: 'Andela',       board: 'Indeed',         date: 'Yesterday',     status: 'applied'   },
    { title: 'Data Analyst',       company: 'MTN Nigeria',  board: 'MyJobMag',       date: 'Yesterday',     status: 'applied'   },
    { title: 'UX Designer',        company: 'Konga',        board: 'BrighterMonday', date: '2 days ago',    status: 'rejected'  }
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

  isPaused = false;

  togglePause() {
    this.isPaused = !this.isPaused;
  }
}