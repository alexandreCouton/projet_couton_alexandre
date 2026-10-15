import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

/**
 * Validateur de groupe (template-driven) : posé sur le <form>,
 * il compare les contrôles `password` et `confirmPassword`.
 * Étant au niveau du formulaire, il est réévalué à chaque frappe
 * dans l'un OU l'autre des deux champs.
 */
@Directive({
  selector: '[appPasswordMatch]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordMatchDirective, multi: true }],
})
export class PasswordMatchDirective implements Validator {
  validate(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  }
}
