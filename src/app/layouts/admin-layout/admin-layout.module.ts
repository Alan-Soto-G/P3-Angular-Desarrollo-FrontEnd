import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { ComponentsModule } from '../../components/components.module';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { RolesComponent } from '../../pages/roles/roles.component';
import { PasswordComponent } from '../../pages/password/password.component';
import { DevicesComponent } from '../../pages/devices/devices.component';
import { AddressComponent } from '../../pages/address/address.component';
import { PermissionsComponent } from '../../pages/permissions/permissions.component';
import { SessionsComponent } from '../../pages/sessions/sessions.component';
import { RolePermissionsComponent } from '../../pages/role-permissions/role-permissions.component';
import { ProfilesComponent } from '../../pages/profiles/profiles.component';
import { UsersComponent } from '../../pages/users/users.component';
import { DigitalSignaturesComponent } from '../../pages/digital-signatures/digital-signatures.component';
import { SecurityQuestionsComponent } from '../../pages/security-questions/security-questions.component';
import { AnswersComponent } from '../../pages/answers/answers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ComponentsModule,
    ClipboardModule // Agregar ClipboardModule aquí
  ],  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TablesComponent,
    IconsComponent,
    MapsComponent,
    RolesComponent,
    PasswordComponent,
    DevicesComponent,
    AddressComponent,
    PermissionsComponent,
    SessionsComponent,    RolePermissionsComponent,
    ProfilesComponent,
    UsersComponent,
    DigitalSignaturesComponent,
    SecurityQuestionsComponent,
    AnswersComponent
  ]
})

export class AdminLayoutModule {}
