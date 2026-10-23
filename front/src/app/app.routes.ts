import { Routes } from '@angular/router';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { PollutionForm } from './pollution-form/pollution-form';
import { PollutionList } from './pollution-list/pollution-list';
import { SignupForm } from './signup-form/signup-form';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  { path: 'pollutions', component: PollutionList, title: 'Pollutions' },
  { path: 'pollutions/new', component: PollutionForm, title: 'Nouvelle pollution' },
  { path: 'pollutions/:id', component: PollutionDetail, title: 'Détail pollution' },
  { path: 'pollutions/:id/edit', component: PollutionForm, title: 'Modifier pollution' },
  { path: 'signup', component: SignupForm, title: 'Inscription' },
  { path: '**', redirectTo: 'pollutions' },
];
