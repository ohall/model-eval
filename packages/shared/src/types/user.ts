/**
 * User interface
 */
export interface User {
  id?: string;
  email: string;
  name?: string;
  picture?: string;
  providerId?: string;
  provider: 'google';
}

/**
 * Authentication response with token
 */
export interface AuthResponse {
  user: User;
  token: string;
}
