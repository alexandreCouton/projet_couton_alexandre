import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AppWindow } from '../shared/app-window/app-window';
import { DraggableDirective } from '../shared/draggable.directive';
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
  imports: [FormsModule, PasswordMatchDirective, AppWindow, DraggableDirective],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.css',
})
export class SignupForm {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  protected model: SignupModel = {
    login: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    email: '',
  };

  /** Compte renvoyé par l'API après inscription. */
  protected readonly createdUser = signal<User | null>(null);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(form: NgForm): void {
    // Comme le formulaire de pollution : on laisse soumettre et on affiche les erreurs.
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    const { confirmPassword, ...request } = this.model;
    this.loading.set(true);
    this.errorMessage.set(null);
    this.userService
      .signup(request)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => this.createdUser.set(user),
        error: (err: HttpErrorResponse) => this.errorMessage.set(this.describeError(err)),
      });
  }

  protected reset(form: NgForm): void {
    form.resetForm();
    this.createdUser.set(null);
    this.errorMessage.set(null);
  }

  private describeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Serveur injoignable. Vérifiez votre connexion.';
    }
    if (err.status === 409) {
      return 'Ce login ou cet email est déjà utilisé.';
    }
    return `Erreur ${err.status} : l'inscription a échoué.`;
  }
}
