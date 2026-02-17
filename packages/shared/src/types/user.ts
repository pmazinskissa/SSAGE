export type UserRole = 'learner' | 'admin' | 'dev_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  oauth_provider: string | null;
  oauth_subject_id: string | null;
  is_active: boolean;
  created_at: string;
  last_active_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface JwtPayload extends AuthUser {
  sub: string;
  iat: number;
  exp: number;
}
