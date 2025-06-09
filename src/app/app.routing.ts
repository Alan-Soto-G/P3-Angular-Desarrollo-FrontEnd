// src/app/app.routing.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AddressComponent } from './pages/address/address.component'; // <-- Asegúrate de importar esto
import { PasswordComponent } from './pages/password/password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/layouts/admin-layout/admin-layout.module').then(
            m => m.AdminLayoutModule
          )
      },
      // 👇 Aquí se define la ruta directamente a AddressComponent
      { path: 'address', component: AddressComponent },
      { path: 'address/create/:userId', component: AddressComponent },
      { path: 'address/edit/:id', component: AddressComponent },

      // Aquí rutas de password. 
      { path: 'password', component: PasswordComponent },
      { path: 'password/create/:userId', component: PasswordComponent },
      { path: 'password/edit/:id', component: PasswordComponent }
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('src/app/layouts/auth-layout/auth-layout.module').then(
            m => m.AuthLayoutModule
          )
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
      useHash: false, // Cambiar esto a false
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
