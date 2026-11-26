import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/** Réserve une route aux visiteurs non connectés (ex. la page de connexion). */
export const guestGuard: CanActivateFn = () => {
  if (!inject(UserService).currentUser()) {
    return true;
  }
  return inject(Router).createUrlTree(['/pollutions']);
};
