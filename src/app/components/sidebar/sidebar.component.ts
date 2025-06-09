import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from 'src/app/services/security.service';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  type: number; // 0->No está logueado, 1->Si está logueado, 2->No importa
}

export const ROUTES: RouteInfo[] = [
  // Rutas que siempre se muestran (type: 2)
  { path: '/dashboard', title: 'Dashboard', icon: 'ni-tv-2 text-primary', class: '', type: 2 },
  
  // Rutas solo para usuarios logueados (type: 1)
  { path: '/icons', title: 'Icons', icon: 'ni-planet text-blue', class: '', type: 1 },
  { path: '/maps', title: 'Maps', icon: 'ni-pin-3 text-orange', class: '', type: 1 },
  { path: '/user-profile', title: 'User profile', icon: 'ni-single-02 text-yellow', class: '', type: 1 },
  { path: '/tables', title: 'Tables', icon: 'ni-bullet-list-67 text-red', class: '', type: 1 },
  { path: '/users', title: 'Usuarios', icon: 'ni-circle-08 text-green', class: '', type: 1 },
  { path: '/roles', title: 'Roles', icon: 'ni-user-run text-purple', class: '', type: 1 },
  { path: '/theaters/list', title: 'Teatros', icon: 'ni-circle-08 text-pink', class: '', type: 1 },
  
  // Rutas de gestión (type: 2 - siempre visibles)
  { path: '/address', title: 'Direcciones', icon: 'ni-map-big text-info', class: '', type: 2 },
  { path: '/address/new/:userId', title: 'Crear Dirección', icon: 'ni-fat-add text-green', class: '', type: 2 },
  { path: '/password', title: 'Contraseñas', icon: 'ni-lock-circle-open text-purple', class: '', type: 2 },
  { path: '/password/create/:userId', title: 'Crear Contraseña', icon: 'ni-fat-add text-green', class: '', type: 2 },
  
  // Rutas solo para usuarios NO logueados (type: 0)
  { path: '/login', title: 'Login', icon: 'ni-key-25 text-info', class: '', type: 0 },
  { path: '/register', title: 'Register', icon: 'ni-circle-08 text-pink', class: '', type: 0 }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router, private securityService: SecurityService) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });
  }
}
