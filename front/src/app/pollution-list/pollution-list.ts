import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';
import { UserService } from '../services/user.service';
import { AppWindow } from '../shared/app-window/app-window';
import { HighlightPollutionDirective } from '../shared/highlight-pollution.directive';
import { ConfirmBox } from '../shared/confirm-box/confirm-box';
import { describeHttpError } from '../shared/http-error';
import { PollutionLevelPipe } from '../shared/pollution-level.pipe';

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pollution-list',
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    AppWindow,
    ConfirmBox,
    PollutionLevelPipe,
    HighlightPollutionDirective,
  ],
  templateUrl: './pollution-list.html',
  styleUrl: './pollution-list.css',
})
export class PollutionList {
  private readonly pollutionService = inject(PollutionService);
  private readonly userService = inject(UserService);

  protected readonly canDelete = computed(() => this.userService.currentUser() !== null);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly types = POLLUTION_TYPES;

  protected readonly pollutions = rxResource({
    stream: () => this.pollutionService.getAll(),
    defaultValue: [],
  });

  protected readonly items = computed(() =>
    this.pollutions.hasValue() ? this.pollutions.value() : [],
  );

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
    return this.items().filter((p) => {
      const haystack = normalize(`${p.titre} ${p.lieu} ${p.description}`);
      return (
        words.every((w) => haystack.includes(w)) &&
        (!type || p.type === type) &&
        (!from || p.dateObservation >= from) &&
        (!to || p.dateObservation <= to)
      );
    });
  });

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
    if (!pollution?.id || !this.canDelete()) {
      this.toDelete.set(null);
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
