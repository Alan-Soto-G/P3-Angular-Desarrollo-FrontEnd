// src/app/app.routing.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticatedGuard } from './guardians/authenticated.guard';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AddressComponent } from './pages/address/address.component';
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
      // Rutas de Address protegidas
      { path: 'address', component: AddressComponent, canActivate: [AuthenticatedGuard] },
      { path: 'address/create/:userId', component: AddressComponent, canActivate: [AuthenticatedGuard] },
      { path: 'address/edit/:id', component: AddressComponent, canActivate: [AuthenticatedGuard] },

      // Rutas de Password protegidas
      { path: 'password', component: PasswordComponent, canActivate: [AuthenticatedGuard] },
      { path: 'password/create/:userId', component: PasswordComponent, canActivate: [AuthenticatedGuard] },
      { path: 'password/edit/:id', component: PasswordComponent, canActivate: [AuthenticatedGuard] }
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
    RouterModule.forRoot(routes, {
      useHash: false,
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
