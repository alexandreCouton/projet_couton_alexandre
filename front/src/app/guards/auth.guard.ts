import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Réserve une route aux utilisateurs connectés.
 * Sinon, redirige vers la connexion en mémorisant la page demandée (`returnUrl`).
 */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(UserService).currentUser()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
