import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { employees as mockEmployees } from "@/mocks/data";
import type { Employee, Role } from "@/types";

interface AuthContextValue {
  user: Employee | null;
  login: (email: string) => boolean;
  logout: () => void;
  setRole: (role: Role) => void; // dev helper for previewing roles
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "staffarc.auth.userId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (userId) localStorage.setItem(STORAGE_KEY, userId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [userId]);

  const user = useMemo(() => mockEmployees.find((e) => e.id === userId) ?? null, [userId]);

  const value: AuthContextValue = {
    user,
    login: (email: string) => {
      const found = mockEmployees.find((e) => e.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUserId(found.id);
        return true;
      }
      return false;
    },
    logout: () => setUserId(null),
    setRole: (role: Role) => {
      const candidate = mockEmployees.find((e) => e.role === role);
      if (candidate) setUserId(candidate.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function canAccess(role: Role | undefined, allowed: Role[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
