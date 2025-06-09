import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { ProfilePictureService } from '../../services/profile-picture.service';

@Component({
  selector: 'app-profile-picture',
  template: `
    <img 
      [src]="profilePictureUrl" 
      [alt]="altText"
      [class]="imageClass"
      [style.width]="size + 'px'"
      [style.height]="size + 'px'"
      (error)="onImageError($event)"
      [title]="user?.name || 'Usuario'"
    />
  `
})
export class ProfilePictureComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() size: number = 40;
  @Input() imageClass: string = 'rounded-circle';
  @Input() showInitialsOnError: boolean = true;

  profilePictureUrl: string = '';
  altText: string = '';

  constructor(private profilePictureService: ProfilePictureService) {}

  ngOnInit() {
    this.updateProfilePicture();
  }

  ngOnChanges() {
    this.updateProfilePicture();
  }

  private updateProfilePicture() {
    this.profilePictureUrl = this.profilePictureService.getBestProfilePicture(this.user, this.size);
    this.altText = this.user?.name || 'Usuario';
  }

  onImageError(event: any) {
    console.log('Error cargando imagen de perfil, usando fallback');
    if (this.showInitialsOnError && this.user?.name) {
      // Si falla la imagen, usar avatar con iniciales
      event.target.src = this.profilePictureService.generateInitialsAvatar(this.user, this.size);
    } else {
      // Si todo falla, usar imagen por defecto
      event.target.src = 'assets/img/theme/team-4-800x800.jpg';
    }
  }
}
