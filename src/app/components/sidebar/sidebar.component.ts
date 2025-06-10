import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/services/security.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    type:number;//0->No está logueado, se pone si no está logueado
                //1->Si está logueado, si se pone si está logueado
                //2->No importa
}
export const ROUTES: RouteInfo[] = [
  // Rutas públicas (siempre visibles)
  { path: '/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '', type: 2 },
  { path: '/login', title: 'Login', icon: 'ni-key-25 text-info', class: '', type: 0 },
  { path: '/register', title: 'Register', icon: 'ni-circle-08 text-pink', class: '', type: 0 },
    // Rutas protegidas (solo cuando está logueado)
  { path: '/user-profile', title: 'Perfil Usuario', icon: 'ni-single-02 text-yellow', class: '', type: 1 },
  { path: '/users', title: 'Usuarios', icon: 'ni-badge text-success', class: '', type: 1 },
  { path: '/roles', title: 'Roles', icon: 'ni-settings-gear-65 text-info', class: '', type: 1 },
  { path: '/devices', title: 'Dispositivos', icon: 'ni-laptop text-info', class: '', type: 1 },  { path: '/digital-signatures', title: 'Firmas Digitales', icon: 'ni-ui-04 text-purple', class: '', type: 1 },
  { path: '/security-questions', title: 'Preguntas de Seguridad', icon: 'ni-check-bold text-success', class: '', type: 1 },
  { path: '/answers', title: 'Respuestas', icon: 'ni-chat-round text-info', class: '', type: 1 },
  { path: '/theaters/list', title: 'Teatros', icon: 'ni-building text-orange', class: '', type: 1 },
  { path: '/address', title: 'Direcciones', icon: 'ni-pin-3 text-orange', class: '', type: 1 },
  { path: '/password', title: 'Contraseñas', icon: 'ni-lock-circle-open text-purple', class: '', type: 1 },
  { path: '/tables', title: 'Tablas', icon: 'ni-bullet-list-67 text-red', class: '', type: 1 },
  { path: '/icons', title: 'Iconos', icon: 'ni-planet text-blue', class: '', type: 1 },
  { path: '/maps', title: 'Mapas', icon: 'ni-pin-3 text-cyan', class: '', type: 1 }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router,private securityService:SecurityService) { }
  ngOnInit() {
    this.updateMenuItems();
    
    // Suscribirse a cambios en el estado de autenticación
    this.securityService.getUser().subscribe(() => {
      this.updateMenuItems();
    });
    
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
   });
  }

  private updateMenuItems() {
    const isLoggedIn = this.securityService.existSession();
    
    this.menuItems = ROUTES.filter(menuItem => {
      if (menuItem.type === 2) {
        // type 2: Siempre visible (Dashboard)
        return true;
      } else if (menuItem.type === 0) {
        // type 0: Solo visible cuando NO está logueado (Login, Register)
        return !isLoggedIn;
      } else if (menuItem.type === 1) {
        // type 1: Solo visible cuando SÍ está logueado (páginas protegidas)
        return isLoggedIn;
      }
      return false;
    });
  }
}