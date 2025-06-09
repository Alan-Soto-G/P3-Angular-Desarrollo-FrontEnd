import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard'; // Importar ClipboardModule

import { ComponentsModule } from '../../components/components.module'; // Importar ComponentsModule
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { RolesComponent } from '../../pages/roles/roles.component';
import {PasswordComponent} from '../../pages/password/password.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// import { ToastrModule } from 'ngx-toastr';

@NgModule({  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ComponentsModule,
    ClipboardModule // Agregar ClipboardModule aquí
  ],declarations: [
    DashboardComponent,
    UserProfileComponent,
    TablesComponent,
    IconsComponent,
    MapsComponent,
    RolesComponent,
    PasswordComponent
  ]
})

export class AdminLayoutModule {}
