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
  const [id, setId] = useState<string | undefined>(
    localStorage.getItem("id") || undefined
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
          
          if (data?.data?.id){
            setId(data.data.id);
            localStorage.setItem("id", data.data.id)
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("email");
          localStorage.removeItem("id");
          setIsLoggedIn(false);
          setUsername(undefined);
          setEmail(undefined);
          setId(undefined)
        });
    } else {
      setId(undefined)
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
      value={{ isLoggedIn, username, email, id, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
