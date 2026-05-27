export interface User {
  username?: string;
  officerName: string;
  email: string;
  mobileNo?: string;
  userType?: string;
  homePage: string;
  roles?: string[];
  [key: string]: any;
}

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}
