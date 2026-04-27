import { Component, ViewEncapsulation } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-preferences',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, FormsModule, SidebarComponent],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent {
  jobTitle = 'Software Engineer';
  location = 'Lagos';
  country = 'Nigeria';
  experience = 'Mid level (3–5 years)';
  currency = 'NGN — Nigerian Naira';
  minSalary = '';

  countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'];
  experienceLevels = ['Entry level (0–2 years)', 'Mid level (3–5 years)', 'Senior level (6+ years)', 'Manager / Lead'];
  currencies = ['NGN — Nigerian Naira', 'USD — US Dollar', 'GBP — British Pound'];
  workTypes = ['Remote', 'Hybrid', 'On-site'];
  selectedWorkType = 'Remote';

  boards = [
    { name: 'LinkedIn',             desc: 'Global professional network',  active: true  },
    { name: 'Jobberman',            desc: "Nigeria's largest job board",  active: true  },
    { name: 'Indeed Nigeria',       desc: 'Global job search platform',   active: true  },
    { name: 'MyJobMag',             desc: 'Nigerian & African jobs',      active: false },
    { name: 'BrighterMonday',       desc: 'East & West Africa jobs',      active: false },
    { name: 'Company career pages', desc: 'Direct applications',          active: true  }
  ];

  selectWorkType(type: string) { this.selectedWorkType = type; }
  toggleBoard(board: any)      { board.active = !board.active; }
  savePreferences()            { console.log('Preferences saved'); }
}