import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-job-boards',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, NgFor, NavbarComponent],
  templateUrl: './job-boards.component.html',
  styleUrls: ['./job-boards.component.scss']
})
export class JobBoardsComponent implements AfterViewInit {

  filters = ['All boards', 'Nigeria', 'Africa', 'Global', 'Remote', 'On-site'];
  activeFilter = 'All boards';

  activeBoards = [
    {
      initials: 'LI', bg: '#EDE9FE', color: '#7C3AED',
      name: 'LinkedIn', region: 'Global',
      desc: 'The world\'s largest professional network. Covers roles across all industries globally including Nigeria and Africa.',
      tags: [{ label: 'Global', type: 'global' }, { label: 'Remote', type: 'remote' }, { label: 'Hybrid', type: 'hybrid' }, { label: 'On-site', type: 'onsite' }],
      jobs: '200+ new jobs/day'
    },
    {
      initials: 'JB', bg: '#FEF3C7', color: '#92400E',
      name: 'Jobberman', region: 'Nigeria',
      desc: 'Nigeria\'s largest job board with thousands of local and remote opportunities across all industries.',
      tags: [{ label: 'Nigeria', type: 'nigeria' }, { label: 'Remote', type: 'remote' }, { label: 'On-site', type: 'onsite' }],
      jobs: '150+ new jobs/day'
    },
    {
      initials: 'IN', bg: '#DBEAFE', color: '#1E40AF',
      name: 'Indeed Nigeria', region: 'Global · Nigeria',
      desc: 'Global job search engine with a strong Nigeria presence. Great for international companies hiring locally.',
      tags: [{ label: 'Global', type: 'global' }, { label: 'Nigeria', type: 'nigeria' }, { label: 'Remote', type: 'remote' }],
      jobs: '100+ new jobs/day'
    },
    {
      initials: 'MJ', bg: '#D1FAE5', color: '#065F46',
      name: 'MyJobMag', region: 'Nigeria · Africa',
      desc: 'Covers Nigerian and broader African job markets with a focus on entry to mid-level professional roles.',
      tags: [{ label: 'Nigeria', type: 'nigeria' }, { label: 'Africa', type: 'africa' }, { label: 'On-site', type: 'onsite' }],
      jobs: '80+ new jobs/day'
    },
    {
      initials: 'BM', bg: '#FEE2E2', color: '#991B1B',
      name: 'BrighterMonday', region: 'East & West Africa',
      desc: 'Leading job board across East and West Africa including Nigeria, Kenya, Uganda and Tanzania.',
      tags: [{ label: 'Africa', type: 'africa' }, { label: 'Nigeria', type: 'nigeria' }, { label: 'On-site', type: 'onsite' }],
      jobs: '60+ new jobs/day'
    },
    {
      initials: 'NG', bg: '#EDE9FE', color: '#5B21B6',
      name: 'Ngcareers', region: 'Nigeria',
      desc: 'Nigerian career platform focused on professional and technical roles across Lagos, Abuja and other cities.',
      tags: [{ label: 'Nigeria', type: 'nigeria' }, { label: 'Hybrid', type: 'hybrid' }, { label: 'On-site', type: 'onsite' }],
      jobs: '40+ new jobs/day'
    },
    {
      initials: 'CP', bg: '#F5F3FF', color: '#7C3AED',
      name: 'Company career pages', region: 'Global · Direct',
      desc: 'We apply directly to company career pages — bypassing job boards for a more direct application.',
      tags: [{ label: 'Global', type: 'global' }, { label: 'Remote', type: 'remote' }, { label: 'On-site', type: 'onsite' }],
      jobs: '500+ companies tracked'
    }
  ];

  comingBoards = [
    {
      initials: 'C24', bg: '#F5F3FF', color: '#9CA3AF',
      name: 'Careers24', region: 'South Africa',
      desc: 'South Africa\'s leading job board covering all major industries and cities including Johannesburg and Cape Town.',
      tags: [{ label: 'Africa', type: 'africa' }, { label: 'On-site', type: 'onsite' }]
    },
    {
      initials: 'HN', bg: '#F5F3FF', color: '#9CA3AF',
      name: 'Hot Nigerian Jobs', region: 'Nigeria',
      desc: 'Focused Nigerian job board with thousands of listings across Lagos, Abuja, Port Harcourt and beyond.',
      tags: [{ label: 'Nigeria', type: 'nigeria' }, { label: 'On-site', type: 'onsite' }]
    }
  ];

  setFilter(f: string) { this.activeFilter = f; }

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
        else entry.target.classList.remove('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));
  }
}