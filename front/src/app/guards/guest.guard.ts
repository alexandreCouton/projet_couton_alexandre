import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../store/auth/auth.state';

/** Réserve une route aux visiteurs non connectés (ex. la page de connexion). */
export const guestGuard: CanActivateFn = () => {
  if (!inject(Store).selectSnapshot(AuthState.isAuthenticated)) {
    return true;
  }
  return inject(Router).createUrlTree(['/pollutions']);
};
