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
import { PermissionService } from './services/permission.service';
import { ProfileService } from './services/profile.service';
import { PagesComponent } from './pages/pages.component';

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
  ],  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    PagesComponent
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