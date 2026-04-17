import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "@/hooks/use-toast";
import { employees } from "@/mocks/data";
import type { Role } from "@/types";

const QUICK_ROLES: Role[] = ["Admin", "Manager", "Team Lead", "Employee"];

export default function Login() {
  const { user, login, setRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      toast({ title: "Welcome back", description: "Signed in to StaffArc." });
      navigate("/dashboard", { replace: true });
    } else {
      toast({
        title: "User not found",
        description: "Try a quick-login below or use a known email like aarav@staffarc.io",
        variant: "destructive",
      });
    }
  };

  const quickLogin = (role: Role) => {
    setRole(role);
    toast({ title: `Signed in as ${role}`, description: "Demo mode" });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
        <div className="mb-6">
          <BrandLogo size={48} />
        </div>

        <Card className="w-full shadow-glow">
          <CardHeader className="space-y-1.5 pb-4">
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Use your work email to access your dashboard.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@staffarc.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                Sign in
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo quick-login</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_ROLES.map((r) => (
                <Button key={r} variant="outline" size="sm" onClick={() => quickLogin(r)}>
                  {r}
                </Button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Try: <span className="font-mono">{employees[0].email}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
