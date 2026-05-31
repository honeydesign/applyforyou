import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  currentStep = 1;
  totalSteps  = 3;
  loading     = false;
  error       = '';

  cvText    = '';
  fileName  = '';
  fileReady = false;
  selectedFile: File | null = null;

  jobTitle         = '';
  location         = '';
  country          = 'Nigeria';
  selectedWorkType = 'Remote';
  experience       = 'Entry level (0–2 years)';

  jobSuggestions:      string[] = [];
  locationSuggestions: string[] = [];

  allJobTitles = [
    'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer',
    'Product Manager', 'Product Designer', 'UX Designer', 'UI Designer', 'UX/UI Designer',
    'Data Analyst', 'Data Scientist', 'Data Engineer', 'Machine Learning Engineer',
    'DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer', 'QA Engineer',
    'Business Analyst', 'Systems Analyst', 'Project Manager', 'Scrum Master',
    'Marketing Manager', 'Digital Marketing Specialist', 'Content Writer', 'Copywriter',
    'Social Media Manager', 'SEO Specialist', 'Growth Hacker',
    'Sales Manager', 'Account Manager', 'Business Development Manager',
    'HR Manager', 'Recruiter', 'Finance Manager', 'Accountant', 'Financial Analyst',
    'Graphic Designer', 'Brand Designer', 'Motion Designer', 'Video Editor',
    'Network Engineer', 'Cybersecurity Analyst', 'IT Support Engineer',
    'Customer Success Manager', 'Operations Manager', 'Supply Chain Manager',
    'Healthcare Administrator', 'Nurse', 'Doctor', 'Pharmacist',
    'Teacher', 'Lecturer', 'Research Analyst', 'Legal Counsel', 'Lawyer'
  ];

  allLocations = [
    'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna',
    'Benin City', 'Warri', 'Owerri', 'Uyo', 'Calabar', 'Jos', 'Ilorin',
    'Abeokuta', 'Onitsha', 'Maiduguri', 'Zaria', 'Aba', 'Asaba',
    'Accra', 'Kumasi', 'Nairobi', 'Mombasa', 'Johannesburg', 'Cape Town',
    'Durban', 'Pretoria', 'Lagos Island', 'Victoria Island', 'Lekki',
    'Ikeja', 'Surulere', 'Yaba', 'Gbagada', 'Ajah', 'Remote'
  ];

  workTypes        = ['Remote', 'Hybrid', 'On-site'];
  countries        = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'];
  experienceLevels = ['Entry level (0–2 years)', 'Mid level (3–5 years)', 'Senior level (6+ years)', 'Manager / Lead'];

  constructor(private http: HttpClient, private router: Router) {}

  get progressWidth() { return (this.currentStep / this.totalSteps) * 100 + '%'; }

  selectWorkType(type: string) { this.selectedWorkType = type; }

  // ── Autocomplete ──────────────────────────────────────────
  onJobTitleInput() {
    const q = this.jobTitle.toLowerCase();
    if (q.length < 2) { this.jobSuggestions = []; return; }
    this.jobSuggestions = this.allJobTitles
      .filter(t => t.toLowerCase().includes(q))
      .slice(0, 6);
  }

  selectJobTitle(title: string) {
    this.jobTitle      = title;
    this.jobSuggestions = [];
  }

  hideJobSuggestions() {
    setTimeout(() => this.jobSuggestions = [], 200);
  }

  onLocationInput() {
    const q = this.location.toLowerCase();
    if (q.length < 2) { this.locationSuggestions = []; return; }
    this.locationSuggestions = this.allLocations
      .filter(l => l.toLowerCase().includes(q))
      .slice(0, 6);
  }

  selectLocation(loc: string) {
    this.location            = loc;
    this.locationSuggestions = [];
  }

  hideLocationSuggestions() {
    setTimeout(() => this.locationSuggestions = [], 200);
  }

  // ── File upload ───────────────────────────────────────────
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.add('dragging');
  }

  onDragLeave(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove('dragging');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('dragging');
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File) {
    const allowed = ['pdf', 'doc', 'docx', 'txt'];
    const ext     = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowed.includes(ext)) {
      this.error = 'Please upload a PDF, DOC, DOCX or TXT file.';
      return;
    }
    this.selectedFile = file;
    this.fileName     = file.name;
    this.fileReady    = true;
    this.error        = '';
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Navigation ────────────────────────────────────────────
  next() {
    if      (this.currentStep === 1) this.saveCV();
    else if (this.currentStep === 2) this.savePreferences();
    else                             this.router.navigate(['/dashboard']);
  }

  back() { if (this.currentStep > 1) this.currentStep--; }

  saveCV() {
    if (this.selectedFile) {
      this.loading = true;
      this.error   = '';
      const formData = new FormData();
      formData.append('cv', this.selectedFile);
      this.http.post<any>(`${environment.apiUrl}/cv/file`, formData, { headers: this.getHeaders() }).subscribe({
        next: () => { this.loading = false; this.currentStep = 2; },
        error: (err) => {
          this.loading = false;
          this.error   = err.error?.error || 'Failed to read file. Please paste your CV text below.';
          this.fileReady = false; this.selectedFile = null;
        }
      });
    } else if (this.cvText.trim()) {
      this.loading = true;
      this.error   = '';
      this.http.post<any>(`${environment.apiUrl}/cv`, { rawText: this.cvText, fileName: 'Pasted CV' }, { headers: this.getHeaders() }).subscribe({
        next: () => { this.loading = false; this.currentStep = 2; },
        error: () => { this.loading = false; this.error = 'Failed to save CV. Please try again.'; }
      });
    } else {
      this.error = 'Please upload a file or paste your CV text below';
    }
  }

  savePreferences() {
    if (!this.jobTitle || !this.location) {
      this.error = 'Please fill in your job title and location';
      return;
    }
    this.loading = true;
    this.error   = '';
    this.http.post<any>(`${environment.apiUrl}/preferences`, {
      jobTitle: this.jobTitle, location: this.location, country: this.country,
      workType: this.selectedWorkType, experience: this.experience,
      currency: 'NGN', boards: ['Jobberman', 'MyJobMag', 'LinkedIn', 'Indeed', 'RemoteOK']
    }, { headers: this.getHeaders() }).subscribe({
      next: () => { this.loading = false; this.currentStep = 3; },
      error: () => { this.loading = false; this.error = 'Failed to save preferences. Please try again.'; }
    });
  }
}