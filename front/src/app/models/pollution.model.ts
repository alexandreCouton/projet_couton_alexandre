/** Types de pollution proposés dans la liste déroulante. */
export const POLLUTION_TYPES = [
  'Plastique',
  'Chimique',
  'Dépôt sauvage',
  'Eau',
  'Air',
  'Autre',
] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

/**
 * Déclaration de pollution telle qu'elle sera envoyée au backend.
 * `id` sera attribué par le serveur lors de la future intégration.
 */
export interface Pollution {
  id?: number;
  titre: string;
  type: PollutionType;
  description: string;
  dateObservation: string; // format ISO AAAA-MM-JJ
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
}
