import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgSwitch, NgSwitchCase, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  stats = [
    { num: '15 min', label: 'Average time to first application' },
    { num: '3×',    label: 'More interviews as early applicant' },
    { num: '50+',   label: 'Jobs applied per week, automatically' }
  ];

  steps = [
    { num: '01', title: 'Upload your CV',       desc: 'Drop in your existing CV — PDF, Word, or paste text. Any format, any experience level.',                             icon: 'document'  },
    { num: '02', title: 'Choose your role',     desc: 'Tell us the job title you want, your location, and whether you prefer remote, hybrid, or in-office.',                icon: 'search'    },
    { num: '03', title: 'AI applies instantly', desc: 'The moment a matching job is posted, our AI tailors your CV and applies — within 15 minutes.',                       icon: 'lightning' },
    { num: '04', title: 'Get email alerts',     desc: 'We email you the moment a company responds. Check your inbox and show up to interview.',                             icon: 'email'     }
  ];

  features = [
    { title: 'Early applicant advantage', desc: 'We monitor job boards every few minutes. You apply before most people even see the posting.',                  icon: 'lightning' },
    { title: 'CV tailored per job',       desc: 'Every application gets a rewritten CV that mirrors the exact keywords of that job description. ATS-optimised.', icon: 'edit'      },
    { title: 'Email notifications',       desc: 'Instant email updates when applied to a job, and when a company responds to your application.',                 icon: 'email'     },
    { title: 'Local + global boards',     desc: 'We cover Jobberman, LinkedIn, Indeed, MyJobMag, BrighterMonday and direct company career pages.',              icon: 'globe'     },
    { title: 'Full application tracker',  desc: 'See every job applied to, which ones were viewed, and your overall response rate in one dashboard.',            icon: 'monitor'   },
    { title: '100% free to start',        desc: 'No credit card. No subscription needed to begin. Start applying today and see results first.',                  icon: 'heart'     }
  ];

  boards = [
    'Jobberman', 'LinkedIn', 'Indeed Nigeria', 'MyJobMag',
    'BrighterMonday', 'Ngcareers', 'Hot Nigerian Jobs',
    'Careers24', 'Company career pages', '+ more coming'
  ];
}