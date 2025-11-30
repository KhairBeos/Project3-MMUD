export interface User {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider: 'local' | 'google';
  isOnline?: boolean;
}
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
}