import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, SignupRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /** Utilisateur connecté (authentification fictive : perdu au rechargement de la page). */
  readonly currentUser = signal<User | null>(null);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  signup(request: SignupRequest): Observable<User> {
    return this.http
      .post<User & { password?: string }>(this.baseUrl, request)
      .pipe(map(({ password, ...user }) => user));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        if (this.currentUser()?.id === id) {
          this.logout();
        }
      }),
    );
  }

  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<User>(`${this.baseUrl}/login`, request)
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
