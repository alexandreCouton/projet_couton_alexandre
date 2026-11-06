import { Routes } from '@angular/router';
import { LoginForm } from './login-form/login-form';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { PollutionForm } from './pollution-form/pollution-form';
import { PollutionList } from './pollution-list/pollution-list';
import { SignupForm } from './signup-form/signup-form';
import { UserList } from './user-list/user-list';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  { path: 'pollutions', component: PollutionList, title: 'Pollutions' },
  { path: 'pollutions/new', component: PollutionForm, title: 'Nouvelle pollution' },
  { path: 'pollutions/:id', component: PollutionDetail, title: 'Détail pollution' },
  { path: 'pollutions/:id/edit', component: PollutionForm, title: 'Modifier pollution' },
  { path: 'users', component: UserList, title: 'Utilisateurs' },
  { path: 'signup', component: SignupForm, title: 'Inscription' },
  { path: 'login', component: LoginForm, title: 'Connexion' },
  { path: '**', redirectTo: 'pollutions' },
];
