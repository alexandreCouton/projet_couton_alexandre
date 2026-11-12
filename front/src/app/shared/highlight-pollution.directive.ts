import { computed, Directive, input } from '@angular/core';
import { PollutionLevel, pollutionLevel } from './pollution-level.pipe';

const LEVEL_COLORS: Record<PollutionLevel, string> = {
  Faible: 'lightgreen',
  Modérée: 'yellow',
  Élevée: 'orange',
  Dangereuse: 'red',
};

/**
 * Colore le fond de l'élément hôte selon le niveau de pollution
 * déduit de l'indice de dangerosité fourni.
 * Exemple : `<td [appHighlightPollution]="indice">…</td>`.
 */
@Directive({
  selector: '[appHighlightPollution]',
  host: {
    '[style.background-color]': 'color()',
  },
})
export class HighlightPollutionDirective {
  /** Indice de dangerosité numérique. */
  readonly indice = input.required<number | null | undefined>({ alias: 'appHighlightPollution' });

  protected readonly color = computed(() => {
    const level = pollutionLevel(this.indice());
    return level ? LEVEL_COLORS[level] : null;
  });
}
