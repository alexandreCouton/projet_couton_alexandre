import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AppWindow } from '../shared/app-window/app-window';
import { ConfirmBox } from '../shared/confirm-box/confirm-box';
import { describeHttpError } from '../shared/http-error';

const NOT_FOUND = 'Utilisateur introuvable (il a peut-être été supprimé).';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-list',
  imports: [RouterLink, AppWindow, ConfirmBox],
  templateUrl: './user-list.html',
  // Même présentation en tableau que la liste des pollutions
  styleUrl: '../pollution-list/pollution-list.css',
})
export class UserList {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly users = rxResource({
    stream: () => this.userService.getAll(),
    defaultValue: [],
  });

  protected readonly items = computed(() => (this.users.hasValue() ? this.users.value() : []));

  protected readonly toDelete = signal<User | null>(null);
  protected readonly deleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected loadError(): string {
    return describeHttpError(this.users.error(), 'le chargement', NOT_FOUND);
  }

  protected confirmDelete(): void {
    const user = this.toDelete();
    if (!user) {
      return;
    }
    this.deleting.set(true);
    this.errorMessage.set(null);
    this.userService
      .delete(user.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.toDelete.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.users.update((list) => list.filter((u) => u.id !== user.id)),
        error: (err) => this.errorMessage.set(describeHttpError(err, 'la suppression', NOT_FOUND)),
      });
  }
}
