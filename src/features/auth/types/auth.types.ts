// NOTE: Optional fields (?:) are avoided here to eliminate type-level ambiguity
// between unloaded/partial profiles and genuinely empty values.
// Nullable fields are explicitly typed as T | null.
export interface User {
  username: string;
  officerName: string;
  roles: string[];

  mobileNo: string | null;
  userType: string | null;
}


export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}
