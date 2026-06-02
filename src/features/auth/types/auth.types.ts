export interface User {
  username?: string;
  officerName: string;
  mobileNo?: string;
  userType?: string;
  roles?: string[];
}

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}
