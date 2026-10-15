/**
 * Configuration de développement (remplace `environment.ts` via `fileReplacements`).
 * `mockApi` active l'intercepteur qui simule le backend localement.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  mockApi: true,
};
