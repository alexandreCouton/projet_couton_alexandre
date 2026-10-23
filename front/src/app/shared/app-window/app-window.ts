import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DraggableDirective } from '../draggable.directive';
import { WindowManager } from '../window-manager.service';

let nextId = 0;

/**
 * Fenêtre Win95 déplaçable : barre de titre, barre de menus (facultative),
 * contenu projeté et barre d'état.
 * Le contenu marqué de l'attribut `status` est projeté dans la barre d'état.
 * Les boutons de la barre de titre réduisent, agrandissent ou ferment la fenêtre.
 */
@Component({
  selector: 'app-window',
  hostDirectives: [DraggableDirective],
  host: {
    class: 'window',
    role: 'dialog',
    '[attr.aria-labelledby]': 'titleId',
    '[class.minimized]': 'minimized()',
    '[class.maximized]': 'maximized()',
  },
  templateUrl: './app-window.html',
})
export class AppWindow {
  /** Texte de la barre de titre. */
  readonly heading = input.required<string>();
  readonly icon = input<string>();
  /** Affiche la barre de menus Fichier / Édition / Aide. */
  readonly menu = input(true);
  readonly closeLink = input<string | readonly unknown[]>();

  private readonly router = inject(Router);
  private readonly draggable = inject(DraggableDirective);
  private readonly windowManager = inject(WindowManager);

  protected readonly titleId = `app-window-title-${nextId++}`;
  protected readonly minimized = signal(false);
  protected readonly maximized = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.windowManager.remove(this.titleId));
  }

  protected minimize(): void {
    this.minimized.set(true);
    this.windowManager.add({
      id: this.titleId,
      heading: this.heading,
      icon: this.icon,
      restore: () => this.restore(),
    });
  }

  private restore(): void {
    this.minimized.set(false);
    this.windowManager.remove(this.titleId);
  }

  protected toggleMaximize(): void {
    this.maximized.update((value) => !value);
    this.draggable.reset();
    this.draggable.enabled.set(!this.maximized());
  }

  protected close(): void {
    const link = this.closeLink();
    if (typeof link === 'string') {
      this.router.navigateByUrl(link);
    } else if (link) {
      this.router.navigate([...link]);
    }
  }
}
