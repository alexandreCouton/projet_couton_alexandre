import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout } from './store/auth/auth.actions';
import { AuthState } from './store/auth/auth.state';
import { WindowManager } from './shared/window-manager.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly windowManager = inject(WindowManager);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  protected readonly username = this.store.selectSignal(AuthState.username);

  protected logout(): void {
    this.store.dispatch(new Logout()).subscribe(() => this.router.navigateByUrl('/pollutions'));
  }
}
