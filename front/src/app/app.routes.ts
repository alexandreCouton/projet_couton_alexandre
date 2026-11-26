import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  {
    path: 'pollutions',
    loadChildren: () => import('./pollution.routes').then((m) => m.POLLUTION_ROUTES),
  },
  {
    path: 'users',
    loadComponent: () => import('./user-list/user-list').then((m) => m.UserList),
    title: 'Utilisateurs',
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup-form/signup-form').then((m) => m.SignupForm),
    title: 'Inscription',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login-form/login-form').then((m) => m.LoginForm),
    title: 'Connexion',
  },
  { path: '**', redirectTo: 'pollutions' },
];
