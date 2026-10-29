import {
  Component,
  DestroyRef,
  inject,
  input,
  numberAttribute,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { AppWindow } from '../shared/app-window/app-window';
import { describeHttpError } from '../shared/http-error';
import { numberValidator, pastDateValidator } from './pollution.validators';

type PollutionField = keyof PollutionForm['form']['controls'];

@Component({
  selector: 'app-pollution-form',
  imports: [ReactiveFormsModule, RouterLink, AppWindow],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.css',
})
export class PollutionForm implements OnInit {
  readonly id = input(undefined, {
    transform: (value: string | undefined) => (value ? numberAttribute(value) : undefined),
  });

  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly types = POLLUTION_TYPES;
  protected readonly today = new Date().toISOString().slice(0, 10);

  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly form = this.fb.group({
    titre: ['', [Validators.required, Validators.maxLength(100)]],
    type: this.fb.control<PollutionType | ''>('', Validators.required),
    description: ['', Validators.required],
    dateObservation: ['', [Validators.required, pastDateValidator]],
    lieu: ['', Validators.required],
    latitude: this.fb.control<number | null>(null, [
      Validators.required,
      numberValidator,
      Validators.min(-90),
      Validators.max(90),
    ]),
    longitude: this.fb.control<number | null>(null, [
      Validators.required,
      numberValidator,
      Validators.min(-180),
      Validators.max(180),
    ]),
    photoUrl: ['', Validators.pattern(/^https?:\/\/\S+$/i)],
  });

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private original: Pollution | null = null;

  ngOnInit(): void {
    const id = this.id();
    if (id === undefined) {
      return;
    }
    this.loading.set(true);
    this.form.disable();
    this.pollutionService
      .getById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pollution) => {
          this.original = pollution;
          this.form.enable();
          this.reset();
        },
        error: (err) => this.errorMessage.set(describeHttpError(err, 'le chargement')),
      });
  }

  /** Vrai si le champ doit afficher son erreur (invalide et déjà visité). */
  protected invalid(name: PollutionField): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const pollution: Pollution = {
      titre: value.titre.trim(),
      type: value.type as PollutionType,
      description: value.description.trim(),
      dateObservation: value.dateObservation,
      lieu: value.lieu.trim(),
      latitude: value.latitude!,
      longitude: value.longitude!,
      photoUrl: value.photoUrl.trim() || null,
    };
    const id = this.id();
    const request =
      id === undefined
        ? this.pollutionService.create(pollution)
        : this.pollutionService.update(id, pollution);

    this.saving.set(true);
    this.errorMessage.set(null);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (saved) => this.router.navigate(['/pollutions', saved.id]),
        error: (err) => this.errorMessage.set(describeHttpError(err, "l'enregistrement")),
      });
  }

  /** Vide le formulaire, ou restaure la pollution chargée en modification. */
  protected reset(): void {
    this.form.reset();
    if (this.original) {
      const { id, photoUrl, ...values } = this.original;
      this.form.patchValue({ ...values, photoUrl: photoUrl ?? '' });
    }
    this.errorMessage.set(null);
  }
}
