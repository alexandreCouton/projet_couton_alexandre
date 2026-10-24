import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { mergeMap, Observable, of, throwError, timer } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { SignupRequest, User } from '../models/user.model';

const LATENCY_MS = 600;

const users: User[] = [
  { id: 1, login: 'admin', lastName: 'Admin', firstName: 'Root', email: 'admin@cnam.fr' },
];
let nextId = 2;

const pollutions: Pollution[] = [
  {
    id: 1,
    titre: 'Bouteilles sur la plage',
    type: 'Plastique',
    description: 'Une cinquantaine de bouteilles échouées après la tempête.',
    dateObservation: '2026-09-12',
    lieu: 'Plage du Prado, Marseille',
    latitude: 43.2593,
    longitude: 5.3752,
    photoUrl: null,
  },
  {
    id: 2,
    titre: 'Fût abandonné',
    type: 'Chimique',
    description: 'Fût métallique rouillé qui fuit, odeur de solvant.',
    dateObservation: '2026-10-02',
    lieu: 'Zone industrielle, Lyon',
    latitude: 45.7215,
    longitude: 4.8542,
    photoUrl: null,
  },
  {
    id: 3,
    titre: 'Gravats en forêt',
    type: 'Dépôt sauvage',
    description: 'Tas de gravats et de plaques de plâtre au bord du chemin.',
    dateObservation: '2026-08-27',
    lieu: 'Forêt de Fontainebleau',
    latitude: 48.4047,
    longitude: 2.7016,
    photoUrl: null,
  },
  {
    id: 4,
    titre: 'Mousse sur la rivière',
    type: 'Eau',
    description: 'Mousse blanche persistante en aval du déversoir.',
    dateObservation: '2026-10-15',
    lieu: 'La Garonne, Toulouse',
    latitude: 43.6045,
    longitude: 1.4442,
    photoUrl: null,
  },
];
let nextPollutionId = 5;

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
  if (path === '/pollutions') {
    if (req.method === 'GET') {
      return ok(req, pollutions);
    }
    if (req.method === 'POST') {
      return createPollution(req as HttpRequest<Pollution>);
    }
  }
  const match = /^\/pollutions\/(\d+)$/.exec(path);
  if (match) {
    const id = Number(match[1]);
    switch (req.method) {
      case 'GET':
        return getPollution(req, id);
      case 'PUT':
        return updatePollution(req as HttpRequest<Pollution>, id);
      case 'DELETE':
        return deletePollution(req, id);
    }
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

function getPollution(req: HttpRequest<unknown>, id: number): Observable<HttpResponse<Pollution>> {
  const pollution = pollutions.find((p) => p.id === id);
  return pollution ? ok(req, pollution) : error(req, 404, `Pollution ${id} introuvable.`);
}

function createPollution(req: HttpRequest<Pollution>): Observable<HttpResponse<Pollution>> {
  if (!isValidPollution(req.body)) {
    return error(req, 400, 'Champs obligatoires manquants.');
  }
  const pollution: Pollution = { ...req.body, id: nextPollutionId++ };
  pollutions.push(pollution);
  return ok(req, pollution, 201);
}

function updatePollution(
  req: HttpRequest<Pollution>,
  id: number,
): Observable<HttpResponse<Pollution>> {
  const index = pollutions.findIndex((p) => p.id === id);
  if (index === -1) {
    return error(req, 404, `Pollution ${id} introuvable.`);
  }
  if (!isValidPollution(req.body)) {
    return error(req, 400, 'Champs obligatoires manquants.');
  }
  pollutions[index] = { ...req.body, id };
  return ok(req, pollutions[index]);
}

function deletePollution(req: HttpRequest<unknown>, id: number): Observable<HttpResponse<null>> {
  const index = pollutions.findIndex((p) => p.id === id);
  if (index === -1) {
    return error(req, 404, `Pollution ${id} introuvable.`);
  }
  pollutions.splice(index, 1);
  return ok(req, null, 204);
}

function isValidPollution(body: Pollution | null): body is Pollution {
  return (
    !!body?.titre &&
    !!body.type &&
    !!body.description &&
    !!body.dateObservation &&
    !!body.lieu &&
    Number.isFinite(body.latitude) &&
    Number.isFinite(body.longitude)
  );
}

function ok<T>(req: HttpRequest<unknown>, body: T, status = 200): Observable<HttpResponse<T>> {
  return of(new HttpResponse({ status, url: req.url, body: structuredClone(body) })).pipe(
    delay(LATENCY_MS),
  );
}

function error(req: HttpRequest<unknown>, status: number, message: string): Observable<never> {
  return timer(LATENCY_MS).pipe(
    mergeMap(() =>
      throwError(() => new HttpErrorResponse({ status, url: req.url, error: { message } })),
    ),
  );
}
