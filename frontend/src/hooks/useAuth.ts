import { useEffect, useState } from "react";
import api, { setToken } from "@/lib/api";

type Role = "ADMIN" | "USER" | "OWNER";
export type User = { id: number; name: string; email: string; address?: string | null; role: Role };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTok] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setTok(t);
      setUser(JSON.parse(u));
      setToken(t);
    }
  }, []);

  function login(token: string, user: User) {
    setTok(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
  }

  function logout() {
    setTok(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(undefined);
  }

  return { user, token, login, logout };
}