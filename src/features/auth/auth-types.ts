export type AuthContextType = {
  isLoggedIn: boolean;
  email: string | undefined
  username: string | undefined;
  id: string | undefined
  login: (token: string) => Promise<void>;
  logout: () => void;
};
