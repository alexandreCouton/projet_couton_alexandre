export interface UserProfile {
  id: number;
  email: string;
  nom: string;
  role: string;
}

export interface AuthStateModel {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
