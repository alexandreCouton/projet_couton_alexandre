import { HttpErrorResponse } from '@angular/common/http';

export function describeHttpError(err: unknown, action: string): string {
  if (!(err instanceof HttpErrorResponse)) {
    return `Erreur inattendue : ${action} a échoué.`;
  }
  if (err.status === 0) {
    return 'Serveur injoignable. Vérifiez votre connexion.';
  }
  if (err.status === 404) {
    return 'Pollution introuvable (elle a peut-être été supprimée).';
  }
  return `Erreur ${err.status} : ${action} a échoué.`;
}
