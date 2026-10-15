import { Component, input } from '@angular/core';
import { DraggableDirective } from '../draggable.directive';

let nextId = 0;

/**
 * Fenêtre Win95 déplaçable : barre de titre, barre de menus (facultative),
 * contenu projeté et barre d'état.
 * Le contenu marqué de l'attribut `status` est projeté dans la barre d'état.
 */
@Component({
  selector: 'app-window',
  hostDirectives: [DraggableDirective],
  host: {
    class: 'window',
    role: 'dialog',
    '[attr.aria-labelledby]': 'titleId',
  },
  templateUrl: './app-window.html',
})
export class AppWindow {
  /** Texte de la barre de titre. */
  readonly heading = input.required<string>();
  /** Nom d'icône pixelarticons (sans le préfixe `pixelart-icons-font-`). */
  readonly icon = input<string>();
  /** Affiche la barre de menus Fichier / Édition / Aide. */
  readonly menu = input(true);

  protected readonly titleId = `app-window-title-${nextId++}`;
}
