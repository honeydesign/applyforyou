import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, NgFor, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  currentStep = 1;
  totalSteps = 3;

  workTypes = ['Remote', 'Hybrid', 'On-site'];
  selectedWorkType = 'Remote';

  jobTitle = '';
  location = '';
  country = 'Nigeria';
  experience = 'Entry level (0–2 years)';
  cvText = '';

  get progressWidth() {
    return (this.currentStep / this.totalSteps) * 100 + '%';
  }

  selectWorkType(type: string) {
    this.selectedWorkType = type;
  }

  next() {
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  back() {
    if (this.currentStep > 1) this.currentStep--;
  }
}