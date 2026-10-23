import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PollutionService } from '../services/pollution.service';
import { AppWindow } from '../shared/app-window/app-window';
import { ConfirmBox } from '../shared/confirm-box/confirm-box';
import { describeHttpError } from '../shared/http-error';

@Component({
  selector: 'app-pollution-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, AppWindow, ConfirmBox],
  templateUrl: './pollution-detail.html',
  styleUrl: './pollution-detail.css',
})
export class PollutionDetail {
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly pollution = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => this.pollutionService.getById(id),
  });

  protected readonly current = computed(() =>
    this.pollution.hasValue() ? this.pollution.value() : undefined,
  );

  protected readonly photoError = linkedSignal({
    source: this.current,
    computation: () => false,
  });

  protected readonly confirming = signal(false);
  protected readonly deleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected loadError(): string {
    return describeHttpError(this.pollution.error(), 'le chargement');
  }

  protected confirmDelete(): void {
    this.deleting.set(true);
    this.errorMessage.set(null);
    this.pollutionService
      .delete(this.id())
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.confirming.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigate(['/pollutions']),
        error: (err) => this.errorMessage.set(describeHttpError(err, 'la suppression')),
      });
  }
}
