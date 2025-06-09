import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { SecurityService } from 'src/app/services/security.service';
import { ProfilePictureService } from 'src/app/services/profile-picture.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User;
  subscription: Subscription;

  constructor(
    private securityService: SecurityService,
    private profilePictureService: ProfilePictureService
  ) { 
    this.subscription = this.securityService.getUser().subscribe(data => {
      this.user = data;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getProfilePictureUrl(): string {
    return this.profilePictureService.getBestProfilePicture(this.user, 180);
  }

  getProfileInitials(): string {
    if (!this.user || !this.user.name) return 'U';
    const names = this.user.name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}
