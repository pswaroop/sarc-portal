import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Employee, Role } from "@/types";

interface AuthContextValue {
  session: Session | null;
  user: Employee | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(authUser: User): Promise<Employee | null> {
  const [{ data: emp }, { data: roleRow }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, employee_code, full_name, primary_skill, created_at")
      .eq("id", authUser.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", authUser.id),
  ]);

  if (!emp) return null;

  const rank = (r: Role) => (r === "Admin" ? 1 : r === "Manager" ? 2 : r === "Team Lead" ? 3 : 4);
  const role: Role =
    (roleRow ?? [])
      .map((r: { role: Role }) => r.role)
      .sort((a, b) => rank(a) - rank(b))[0] ?? "Employee";

  return {
    id: emp.id,
    employee_code: emp.employee_code,
    full_name: emp.full_name,
    primary_skill: emp.primary_skill,
    role,
    email: authUser.email ?? undefined,
    created_at: emp.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CRITICAL: subscribe BEFORE getSession to avoid race
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // Defer Supabase calls outside the listener
        setTimeout(() => {
          fetchProfile(sess.user).then(setUser);
        }, 0);
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      if (sess?.user) setUser(await fetchProfile(sess.user));
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      },
    }),
    [session, user, loading]
  );

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
