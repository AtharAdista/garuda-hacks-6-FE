import { useContext } from "react";
import { AuthContext } from "./auth-context";
import type { AuthContextType } from "./auth-types";

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
