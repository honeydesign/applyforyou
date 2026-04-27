import { Component, ViewEncapsulation } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgIf, FormsModule, SidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  firstName = 'Chidi';
  lastName = 'Okafor';
  email = 'chidi@email.com';
  phone = '';
  location = 'Lagos, Nigeria';
  summary = '';
  cvName = 'Chidi_Okafor_CV.pdf';
  cvDate = 'Uploaded 3 days ago · 245 KB';

  removeCV() {
    this.cvName = '';
    this.cvDate = '';
  }

  saveChanges() {
    console.log('Profile saved');
  }
}