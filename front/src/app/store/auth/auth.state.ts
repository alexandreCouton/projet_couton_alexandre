import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Login, Logout } from './auth.actions';
import { AuthStateModel, UserProfile } from './auth.model';

const INITIAL_STATE: AuthStateModel = {
  user: null,
  isAuthenticated: false,
};

/** État d'authentification (simulé), persisté dans le localStorage sous la clé `auth`. */
@State<AuthStateModel>({
  name: 'auth',
  defaults: INITIAL_STATE,
})
@Injectable()
export class AuthState {
  @Selector()
  static user(state: AuthStateModel): UserProfile | null {
    return state.user;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static username(state: AuthStateModel): string | null {
    return state.user?.nom ?? null;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { payload }: Login): void {
    // Profil simulé : identifiant et rôle fictifs en attendant l'authentification JWT.
    ctx.patchState({
      user: { id: Date.now(), email: payload.email, nom: payload.nom, role: 'user' },
      isAuthenticated: true,
    });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>): void {
    ctx.setState(INITIAL_STATE);
  }
}
