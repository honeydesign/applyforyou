import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, FormsModule, SidebarComponent],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {

  jobTitle    = '';
  location    = '';
  country     = 'Nigeria';
  experience  = 'Entry level (0–2 years)';
  currency    = 'NGN — Nigerian Naira';
  minSalary   = '';
  saving      = false;
  success     = '';
  error       = '';

  countries      = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'];
  experienceLevels = ['Entry level (0–2 years)', 'Mid level (3–5 years)', 'Senior level (6+ years)', 'Manager / Lead'];
  currencies     = ['NGN — Nigerian Naira', 'USD — US Dollar', 'GBP — British Pound'];
  workTypes      = ['Remote', 'Hybrid', 'On-site'];
  selectedWorkType = 'Remote';

  boards = [
    { name: 'LinkedIn',             desc: 'Global professional network',  active: true  },
    { name: 'Jobberman',            desc: "Nigeria's largest job board",  active: true  },
    { name: 'Indeed Nigeria',       desc: 'Global job search platform',   active: true  },
    { name: 'MyJobMag',             desc: 'Nigerian & African jobs',      active: false },
    { name: 'BrighterMonday',       desc: 'East & West Africa jobs',      active: false },
    { name: 'Company career pages', desc: 'Direct applications',          active: true  }
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadPreferences(); }

  loadPreferences() {
    this.api.get<any>('/preferences').subscribe({
      next: (data) => {
        this.jobTitle         = data.jobTitle    || '';
        this.location         = data.location    || '';
        this.country          = data.country     || 'Nigeria';
        this.selectedWorkType = data.workType    || 'Remote';
        this.experience       = data.experience  || 'Entry level (0–2 years)';
        this.currency         = data.currency    || 'NGN — Nigerian Naira';
        this.minSalary        = data.minSalary?.toString() || '';
        if (data.boards) {
          const savedBoards = Array.isArray(data.boards) ? data.boards : JSON.parse(data.boards);
          this.boards = this.boards.map(b => ({ ...b, active: savedBoards.includes(b.name) }));
        }
      },
      error: () => {}
    });
  }

  selectWorkType(type: string) { this.selectedWorkType = type; }
  toggleBoard(board: any)      { board.active = !board.active; }

  savePreferences() {
    this.saving  = true;
    this.success = '';
    this.error   = '';

    const activeBoards = this.boards.filter(b => b.active).map(b => b.name);

    this.api.post<any>('/preferences', {
      jobTitle:   this.jobTitle,
      location:   this.location,
      country:    this.country,
      workType:   this.selectedWorkType,
      experience: this.experience,
      currency:   this.currency,
      minSalary:  this.minSalary ? parseInt(this.minSalary) : null,
      boards:     activeBoards
    }).subscribe({
      next: () => {
        this.saving  = false;
        this.success = 'Preferences saved! The AI will apply based on these settings.';
        setTimeout(() => this.success = '', 4000);
      },
      error: () => {
        this.saving = false;
        this.error  = 'Failed to save preferences. Please try again.';
      }
    });
  }
}