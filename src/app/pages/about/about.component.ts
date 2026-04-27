import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-about',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgFor, RouterLink, NavbarComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit {

  stats = [
    { num: '10,000+',  label: 'Job seekers helped'        },
    { num: '500,000+', label: 'Applications sent'         },
    { num: '3×',       label: 'More interviews on average' },
    { num: '10+',      label: 'Job boards monitored'      }
  ];

  values = [
    { title: 'People first',      desc: 'Behind every CV is a real person with real ambitions. We never lose sight of that.'                                        },
    { title: 'Speed matters',     desc: 'The first 50 applicants get the most attention. We make sure you\'re always in that group.'                               },
    { title: 'Radical honesty',   desc: 'We never fabricate experience. We just present your real skills in the best possible way.'                                },
    { title: 'Built for Africa',  desc: 'We cover Nigerian, Ghanaian, Kenyan and South African job markets natively — not as an afterthought.'                    },
    { title: 'Accessible to all', desc: 'Free to start, priced fairly. Everyone deserves a shot at the opportunities they\'ve worked for.'                         },
    { title: 'Always improving',  desc: 'Every interview our users land teaches our AI how to do better for the next person.'                                      }
  ];

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-section').forEach(el => observer.observe(el));
  }
}