import { Routes } from '@angular/router';
import { authGuard } from './modules/authentication/guards/auth.guard';
import { guestGuard } from './modules/authentication/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
        canActivate: [guestGuard],
        data: { hideSidebar: true }
    },
    {
        path: 'odin',
        loadChildren: () => import('./modules/odin/odin.module').then(m => m.OdinModule),
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
