import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignupRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  signup(request: SignupRequest): Observable<User> {
    return this.http
      .post<User & { password?: string }>(this.baseUrl, request)
      .pipe(map(({ password, ...user }) => user));
  }
}
