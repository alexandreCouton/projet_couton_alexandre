import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Refuse tout ce qui n'est pas un nombre fini (NaN, Infinity, texte...). */
export const numberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === '') {
    return null; // laissé à Validators.required
  }
  return typeof value === 'number' && Number.isFinite(value) ? null : { notANumber: true };
};

/** Vérifie que la date (AAAA-MM-JJ) existe réellement et n'est pas dans le futur. */
export const pastDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value;
  if (!value) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return { invalidDate: true };
  }
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  // new Date(2025, 1, 31) déborde sur mars : on détecte ainsi les dates inexistantes.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return { invalidDate: true };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today ? { futureDate: true } : null;
};
