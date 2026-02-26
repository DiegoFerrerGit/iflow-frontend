import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
        data: { hideSidebar: true }
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
    },
    {
        path: 'odin',
        loadChildren: () => import('./modules/odin/odin-module').then(m => m.OdinModule)
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
