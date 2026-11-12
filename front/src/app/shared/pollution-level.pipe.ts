import { Pipe, PipeTransform } from '@angular/core';

export type PollutionLevel = 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse';

export function pollutionLevel(indice: number | null | undefined): PollutionLevel | null {
  if (indice == null || Number.isNaN(indice)) {
    return null;
  }
  if (indice <= 20) {
    return 'Faible';
  }
  if (indice <= 50) {
    return 'Modérée';
  }
  if (indice <= 100) {
    return 'Élevée';
  }
  return 'Dangereuse';
}

@Pipe({ name: 'pollutionLevel' })
export class PollutionLevelPipe implements PipeTransform {
  transform(indice: number | null | undefined): PollutionLevel | '' {
    return pollutionLevel(indice) ?? '';
  }
}
