import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UserService } from '../services/user.service';
import { AppWindow } from '../shared/app-window/app-window';
import { describeHttpError } from '../shared/http-error';

@Component({
  selector: 'app-login-form',
  imports: [FormsModule, AppWindow],
  templateUrl: './login-form.html',
  styleUrl: '../signup-form/signup-form.css',
})
export class LoginForm {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly model = { login: '', password: '' };
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    this.userService
      .login(this.model)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigate(['/pollutions']),
        error: (err: HttpErrorResponse) =>
          this.errorMessage.set(
            err.status === 401
              ? 'Login ou mot de passe incorrect.'
              : describeHttpError(err, 'la connexion'),
          ),
      });
  }
}
