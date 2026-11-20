import {
  ChangeDetectionStrategy,
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
import { HighlightPollutionDirective } from '../shared/highlight-pollution.directive';
import { describeHttpError } from '../shared/http-error';
import { PollutionLevelPipe } from '../shared/pollution-level.pipe';
import { numberValidator, pastDateValidator } from './pollution.validators';

type PollutionField = keyof PollutionForm['form']['controls'];

/** Formats acceptés pour une photo envoyée depuis l'appareil (stockée en base64). */
const PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const PHOTO_MAX_BYTES = 1024 * 1024; // 1 Mo

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pollution-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppWindow,
    PollutionLevelPipe,
    HighlightPollutionDirective,
  ],
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
    indiceDangerosite: this.fb.control<number | null>(null, [
      Validators.required,
      numberValidator,
      Validators.min(0),
      Validators.pattern(/^\d+$/),
    ]),
  });

  /** Photo choisie sur l'appareil, encodée en base64 (data URL). Prioritaire sur l'URL saisie. */
  protected readonly photoData = signal<string | null>(null);
  protected readonly photoError = signal<string | null>(null);
  protected readonly photoTypes = PHOTO_TYPES.join(',');

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
      photoUrl: this.photoData() ?? (value.photoUrl.trim() || null),
      indiceDangerosite: value.indiceDangerosite!,
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
      const embedded = photoUrl?.startsWith('data:') ?? false;
      this.form.patchValue({ ...values, photoUrl: embedded ? '' : (photoUrl ?? '') });
      this.photoData.set(embedded ? photoUrl : null);
    } else {
      this.photoData.set(null);
    }
    this.photoError.set(null);
    this.errorMessage.set(null);
  }

  /** Lit le fichier image choisi et le convertit en base64 pour l'enregistrer en base. */
  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!PHOTO_TYPES.includes(file.type)) {
      this.photoError.set('Format non pris en charge (PNG, JPEG, GIF ou WebP).');
    } else if (file.size > PHOTO_MAX_BYTES) {
      this.photoError.set('Image trop lourde (1 Mo maximum).');
    } else {
      this.photoError.set(null);
      const reader = new FileReader();
      reader.onload = () => {
        this.photoData.set(reader.result as string);
        this.form.controls.photoUrl.reset();
      };
      reader.onerror = () => this.photoError.set("Impossible de lire l'image.");
      reader.readAsDataURL(file);
      return;
    }
    input.value = '';
  }

  protected removePhoto(): void {
    this.photoData.set(null);
    this.photoError.set(null);
  }
}
