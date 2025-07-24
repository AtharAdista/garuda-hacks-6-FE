export type AuthContextType = {
  isLoggedIn: boolean;
  email: string | undefined
  username: string | undefined;
  login: (token: string) => Promise<void>;
  logout: () => void;
};
