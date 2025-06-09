import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilePictureService {
  
  private defaultProfilePicture = 'assets/img/theme/team-4-800x800.jpg';
  
  constructor() { }

  /**
   * Obtiene la URL de la foto de perfil del usuario
   * @param user Usuario del que se quiere obtener la foto
   * @returns URL de la foto de perfil o imagen por defecto
   */
  getProfilePictureUrl(user: User | null): string {
    if (!user) {
      return this.defaultProfilePicture;
    }

    // Si el usuario tiene una foto de perfil (Google, GitHub, etc.)
    if (user.picture && this.isValidUrl(user.picture)) {
      return user.picture;
    }

    // Si no tiene foto, usar la imagen por defecto
    return this.defaultProfilePicture;
  }

  /**
   * Verifica si una URL es válida
   * @param url URL a verificar
   * @returns true si es válida, false si no
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Genera una URL de avatar con las iniciales del usuario
   * @param user Usuario del que se quieren las iniciales
   * @param size Tamaño del avatar (por defecto 100)
   * @returns URL del avatar generado
   */
  generateInitialsAvatar(user: User | null, size: number = 100): string {
    if (!user || !user.name) {
      return this.defaultProfilePicture;
    }

    const initials = this.getInitials(user.name);
    // Usando un servicio de avatares con iniciales
    const backgroundColor = this.generateBackgroundColor(user.name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${backgroundColor}&color=fff&bold=true`;
  }

  /**
   * Obtiene las iniciales del nombre de usuario
   * @param name Nombre del usuario
   * @returns Iniciales del usuario
   */
  private getInitials(name: string): string {
    if (!name) return 'U';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Genera un color de fondo basado en el nombre del usuario
   * @param name Nombre del usuario
   * @returns Color hexadecimal sin #
   */
  private generateBackgroundColor(name: string): string {
    const colors = [
      '3498db', '9b59b6', 'e74c3c', '1abc9c', 'f39c12', 
      '2ecc71', 'e67e22', '95a5a6', '34495e', 'f1c40f'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Obtiene la mejor foto de perfil disponible
   * Si tiene foto de Google/GitHub la usa, si no genera una con iniciales
   * @param user Usuario
   * @param size Tamaño del avatar
   * @returns URL de la mejor foto disponible
   */
  getBestProfilePicture(user: User | null, size: number = 100): string {
    if (!user) {
      return this.defaultProfilePicture;
    }

    // Prioridad 1: Foto de perfil real (Google, GitHub, etc.)
    if (user.picture && this.isValidUrl(user.picture)) {
      return user.picture;
    }

    // Prioridad 2: Avatar con iniciales
    if (user.name) {
      return this.generateInitialsAvatar(user, size);
    }

    // Prioridad 3: Imagen por defecto
    return this.defaultProfilePicture;
  }
}
