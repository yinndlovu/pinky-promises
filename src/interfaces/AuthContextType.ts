export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (token: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}
