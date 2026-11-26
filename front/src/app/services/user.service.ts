import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, User } from '../models/user.model';
import { Logout } from '../store/auth/auth.actions';
import { AuthState } from '../store/auth/auth.state';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  signup(request: SignupRequest): Observable<User> {
    return this.http
      .post<User & { password?: string }>(this.baseUrl, request)
      .pipe(map(({ password, ...user }) => user));
  }

  /** Supprime un utilisateur ; déconnecte la session si c'est l'utilisateur connecté. */
  delete(user: User): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${user.id}`).pipe(
      tap(() => {
        if (this.store.selectSnapshot(AuthState.user)?.email === user.email) {
          this.store.dispatch(new Logout());
        }
      }),
    );
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, request);
  }
}
