/**
 * Configuration de développement (remplace `environment.ts` via `fileReplacements`).
 * Appelle l'API lancée en local (`npm run dev` dans `api/`).
 * Passer `mockApi` à true pour simuler le backend avec l'intercepteur, sans serveur.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mockApi: false,
};
