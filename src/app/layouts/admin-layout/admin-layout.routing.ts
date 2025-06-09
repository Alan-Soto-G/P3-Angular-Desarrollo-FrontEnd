import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { UsersComponent } from '../../pages/users/users.component';
import { RolesComponent } from '../../pages/roles/roles.component';
// Combinar AMBOS imports sin duplicar
import { SessionsComponent } from '../../pages/sessions/sessions.component';
import { PermissionsComponent } from '../../pages/permissions/permissions.component';
import { RolePermissionsComponent } from '../../pages/role-permissions/role-permissions.component';
import { PasswordComponent } from '../../pages/password/password.component';
import { AuthenticatedGuard } from 'src/app/guardians/authenticated.guard';
import { ProfilesComponent } from 'src/app/pages/profiles/profiles.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'user-profile', component: UserProfileComponent },
    { path: 'tables', component: TablesComponent },
    { path: 'icons', component: IconsComponent },
    { path: 'maps', component: MapsComponent },
    { 
        path: 'users', 
        component: UsersComponent,
        //canActivate: [AuthenticatedGuard]
    },
    { 
        path: 'roles', 
        component: RolesComponent,
        //canActivate: [AuthenticatedGuard]
    },
    { 
        path: 'permissions', 
        component: PermissionsComponent,
        //canActivate: [AuthenticatedGuard]
    },
    { 
        path: 'role-permissions', 
        component: RolePermissionsComponent,
        //canActivate: [AuthenticatedGuard]
    },
    { 
        path: 'sessions', 
        component: SessionsComponent,
        //canActivate: [AuthenticatedGuard]
    },
     { 
        path: 'profiles', 
        component: ProfilesComponent,
        //canActivate: [AuthenticatedGuard]
    },
    {
        path: 'passwords',
        component: PasswordComponent,
        //canActivate: [AuthenticatedGuard]
    },
    {
        path: 'theaters',
        canActivate: [AuthenticatedGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('src/app/pages/theaters/theaters.module').then(m => m.TheatersModule)
            }
        ]
    }
];