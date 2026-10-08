import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { DraggableDirective } from '../shared/draggable.directive';
import { PollutionRecap } from '../pollution-recap/pollution-recap';
import { numberValidator, pastDateValidator } from './pollution.validators';

@Component({
  selector: 'app-pollution-form',
  imports: [ReactiveFormsModule, DraggableDirective, PollutionRecap],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.css',
})
export class PollutionForm {
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

  /** Déclaration validée, transmise au récapitulatif. null = formulaire affiché. */
  protected readonly declared = signal<Pollution | null>(null);

  /** Vrai si le champ doit afficher son erreur (invalide et déjà visité). */
  protected invalid(name: string): boolean {
    const control = this.form.get(name)!;
    return control.invalid && control.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.declared.set({
      titre: value.titre.trim(),
      type: value.type as PollutionType,
      description: value.description.trim(),
      dateObservation: value.dateObservation,
      lieu: value.lieu.trim(),
      latitude: value.latitude!,
      longitude: value.longitude!,
      photoUrl: value.photoUrl.trim() || null,
    });
  }

  protected newDeclaration(): void {
    this.form.reset();
    this.declared.set(null);
  }
}
