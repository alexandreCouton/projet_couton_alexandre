import { Component } from '@angular/core';
import { PollutionForm } from './pollution-form/pollution-form';
import { SignupForm } from './signup-form/signup-form';

@Component({
  imports: [SignupForm, PollutionForm],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
