import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { AppWindow } from '../shared/app-window/app-window';
import { ConfirmBox } from '../shared/confirm-box/confirm-box';
import { describeHttpError } from '../shared/http-error';

/** Minuscules sans accents, pour une recherche tolérante. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

@Component({
  selector: 'app-pollution-list',
  imports: [FormsModule, RouterLink, DatePipe, AppWindow, ConfirmBox],
  templateUrl: './pollution-list.html',
  styleUrl: './pollution-list.css',
})
export class PollutionList {
  private readonly pollutionService = inject(PollutionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly types = POLLUTION_TYPES;

  protected readonly pollutions = rxResource({
    stream: () => this.pollutionService.getAll(),
    defaultValue: [],
  });

  // Critères de filtre
  protected readonly search = signal('');
  protected readonly type = signal<PollutionType | ''>('');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');

  protected readonly hasFilters = computed(
    () => !!(this.search().trim() || this.type() || this.dateFrom() || this.dateTo()),
  );

  protected readonly filtered = computed(() => {
    const words = normalize(this.search()).split(/\s+/).filter(Boolean);
    const type = this.type();
    const from = this.dateFrom();
    const to = this.dateTo();
    return this.pollutions.value().filter((p) => {
      const haystack = normalize(`${p.titre} ${p.lieu} ${p.description}`);
      return (
        words.every((w) => haystack.includes(w)) &&
        (!type || p.type === type) &&
        // dates ISO AAAA-MM-JJ : la comparaison de chaînes suffit
        (!from || p.dateObservation >= from) &&
        (!to || p.dateObservation <= to)
      );
    });
  });

  /** Pollution en attente de confirmation de suppression. */
  protected readonly toDelete = signal<Pollution | null>(null);
  protected readonly deleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected resetFilters(): void {
    this.search.set('');
    this.type.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
  }

  protected loadError(): string {
    return describeHttpError(this.pollutions.error(), 'le chargement');
  }

  protected confirmDelete(): void {
    const pollution = this.toDelete();
    if (!pollution?.id) {
      return;
    }
    this.deleting.set(true);
    this.errorMessage.set(null);
    this.pollutionService
      .delete(pollution.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.toDelete.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.pollutions.update((list) => list.filter((p) => p.id !== pollution.id)),
        error: (err) => this.errorMessage.set(describeHttpError(err, 'la suppression')),
      });
  }
}
