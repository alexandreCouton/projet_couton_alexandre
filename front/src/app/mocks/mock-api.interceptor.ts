import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { mergeMap, Observable, of, throwError, timer } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SignupRequest, User } from '../models/user.model';

const LATENCY_MS = 600;

const users: User[] = [
  { id: 1, login: 'admin', lastName: 'Admin', firstName: 'Root', email: 'admin@cnam.fr' },
];
let nextId = 2;

/**
 * Faux backend : intercepte les requêtes vers `environment.apiUrl` et y répond
 * localement, sans appel réseau. Les autres requêtes passent normalement.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  const path = req.url.slice(environment.apiUrl.length);

  if (req.method === 'POST' && path === '/users') {
    return signup(req as HttpRequest<SignupRequest>);
  }
  return error(req, 404, `Route inconnue : ${req.method} ${path}`);
};

function signup(req: HttpRequest<SignupRequest>): Observable<HttpResponse<User>> {
  const body = req.body;
  if (!body?.login || !body.password || !body.lastName || !body.firstName || !body.email) {
    return error(req, 400, 'Champs obligatoires manquants.');
  }
  if (users.some((u) => u.login === body.login || u.email === body.email)) {
    return error(req, 409, 'Login ou email déjà utilisé.');
  }

  const { password, ...data } = body;
  const user: User = { id: nextId++, ...data };
  users.push(user);

  return of(new HttpResponse({ status: 201, url: req.url, body: user })).pipe(delay(LATENCY_MS));
}

function error(req: HttpRequest<unknown>, status: number, message: string): Observable<never> {
  return timer(LATENCY_MS).pipe(
    mergeMap(() =>
      throwError(() => new HttpErrorResponse({ status, url: req.url, error: { message } })),
    ),
  );
}
