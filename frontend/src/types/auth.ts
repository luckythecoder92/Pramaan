export interface AuthUser {
  id: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  success: boolean;
  user: AuthUser;
  access_token: string | null;
  token_type: string;
}

export interface MeResponse {
  success: boolean;
  user: AuthUser;
}
