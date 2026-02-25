import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { LoginComponent } from './component/login/login.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { PasswordResetComponent } from './component/password-reset/password-reset.component';
import { ProfileComponent } from './component/profile/profile.component';
import { RegisterComponent } from './component/register/register.component';
import { UserSettingComponent } from './component/user-setting/user-setting.component';
import { UsersComponent } from './component/users/users.component';


export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/login' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'users', component: UsersComponent, canActivate: [authGuard] },
    { path: 'register', component: RegisterComponent },
    {
        path: 'settings', component: UserSettingComponent,
        canActivate: [authGuard],
        children: [
            { path: 'profile', component: ProfileComponent },
            { path: 'resetPassword', component: PasswordResetComponent }
        ]
    },
    { path: '**', component: PageNotFoundComponent }


];
