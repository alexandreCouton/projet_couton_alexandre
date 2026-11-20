import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
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
  protected readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.userService.logout();
    this.router.navigateByUrl('/pollutions');
  }
}
