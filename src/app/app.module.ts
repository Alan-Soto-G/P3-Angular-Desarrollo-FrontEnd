// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AddressComponent } from './pages/address/address.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsModule } from './components/components.module';
import { routes } from './app.routing';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthenticatedGuard } from './guardians/authenticated.guard';
import { NoAuthenticatedGuard } from './guardians/no-authenticated.guard';
import { GoogleMapsModule } from '@angular/google-maps';
import { PermissionsComponent } from './pages/permissions/permissions.component';
import { PermissionService } from './services/permission.service';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { RolePermissionsComponent } from './pages/role-permissions/role-permissions.component';
import { PagesComponent } from './pages/pages.component';
import { ProfilesComponent } from './pages/profiles/profiles.component'; 
import { ProfileService } from './services/profile.service'; // 👈 AGREGAR ESTA LÍNEA


@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    AddressComponent,
    PermissionsComponent,
    SessionsComponent,
    RolePermissionsComponent,
    PagesComponent,
    ProfilesComponent
  ],
  imports: [
    GoogleMapsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    AuthenticatedGuard,
    NoAuthenticatedGuard,
    PermissionService ,// 👈 AGREGAR ESTA LÍNEA
    ProfileService // 👈 AGREGAR ESTA LÍNEA

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}