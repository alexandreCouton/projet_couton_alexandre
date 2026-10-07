import { Component } from '@angular/core';
import { SignupForm } from './signup-form/signup-form';

@Component({
  imports: [SignupForm],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
