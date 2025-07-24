import { useState, useEffect } from "react";
import { getCurrentUser } from "@/features/user/api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState<string | undefined>(
    localStorage.getItem("username") || undefined
  );
  const [email, setEmail] = useState<string | undefined>(
    localStorage.getItem("email") || undefined
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (token) {
      getCurrentUser()
        .then((data) => {
          if (data?.data?.username) {
            setUsername(data.data.username);
            localStorage.setItem("username", data.data.username);
          }
          if (data?.data?.email) {
            setEmail(data.data.email);
            localStorage.setItem("email", data.data.email);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("email");
          setIsLoggedIn(false);
          setUsername(undefined);
          setEmail(undefined);
        });
    } else {
      setUsername(undefined);
      setEmail(undefined);
    }
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
    try {
      const data = await getCurrentUser();
      if (data?.data?.username) {
        setUsername(data.data.username);
        localStorage.setItem("username", data.data.username);
      }
      if (data?.data?.email) {
        setEmail(data.data.email);
        localStorage.setItem("email", data.data.email);
      }
    } catch {
      setUsername(undefined);
      setEmail(undefined);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setUsername(undefined);
    setEmail(undefined);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, email, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
