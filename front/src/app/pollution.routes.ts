import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const POLLUTION_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pollution-list/pollution-list').then((m) => m.PollutionList),
    title: 'Pollutions',
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () => import('./pollution-form/pollution-form').then((m) => m.PollutionForm),
    title: 'Nouvelle pollution',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pollution-detail/pollution-detail').then((m) => m.PollutionDetail),
    title: 'Détail pollution',
  },
  {
    path: ':id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pollution-form/pollution-form').then((m) => m.PollutionForm),
    title: 'Modifier pollution',
  },
];
