import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DraggableDirective } from './draggable.directive';
import { PasswordMatchDirective } from './password-match.directive';

export interface SignupModel {
  login: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  email: string;
}

@Component({
  selector: 'app-signup-form',
  imports: [FormsModule, PasswordMatchDirective, DraggableDirective],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css',
})
export class SignupForm {
  protected model: SignupModel = {
    login: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    email: '',
  };

  protected readonly submitted = signal<Omit<SignupModel, 'password' | 'confirmPassword'> | null>(
    null,
  );

  protected onSubmit(form: NgForm): void {
    // Double verrou : le bouton est désactivé, mais on refuse aussi
    // une soumission forcée (touche Entrée, DOM modifié...).
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    const { password, confirmPassword, ...publicData } = this.model;
    this.submitted.set(publicData);
  }

  protected reset(form: NgForm): void {
    form.resetForm();
    this.submitted.set(null);
  }
}
