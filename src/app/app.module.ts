import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthenticatedGuard } from './guardians/authenticated.guard';
import { NoAuthenticatedGuard } from './guardians/no-authenticated.guard';

import { GoogleMapsModule } from '@angular/google-maps';
import { AddressComponent } from './pages/address/address.component';
import { PermissionsComponent } from './pages/permissions/permissions.component';
import { PermissionService } from './services/permission.service';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { RolePermissionsComponent } from './pages/role-permissions/role-permissions.component';
import { PagesComponent } from './pages/pages.component';
import { ProfilesComponent } from './pages/profiles/profiles.component'; 
import { ProfileService } from './services/profile.service';
import { UsersComponent } from './pages/users/users.component';

@NgModule({
  imports: [
    GoogleMapsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    NgbModule,
    RouterModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    AddressComponent,
    PermissionsComponent,
    SessionsComponent,
    RolePermissionsComponent,
    PagesComponent,
    ProfilesComponent,
    UsersComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthenticatedGuard,
    NoAuthenticatedGuard,
    PermissionService,
    ProfileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }