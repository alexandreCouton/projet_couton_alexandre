export interface SignupRequest {
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  email: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface User {
  id: number;
  login: string;
  lastName: string;
  firstName: string;
  email: string;
}
