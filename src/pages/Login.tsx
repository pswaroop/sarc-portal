import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({
        title: "Sign-in failed",
        description: error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Welcome back", description: "Signed in to StaffArc." });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-8">
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
                  autoComplete="email"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || loading}
                className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Need access? Ask an Admin to invite you from the Users page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
