import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pollution } from '../models/pollution.model';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pollutions`;

  getAll(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.baseUrl);
  }

  getById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.baseUrl}/${id}`);
  }

  create(pollution: Pollution): Observable<Pollution> {
    return this.http.post<Pollution>(this.baseUrl, pollution);
  }

  update(id: number, pollution: Pollution): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.baseUrl}/${id}`, pollution);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
