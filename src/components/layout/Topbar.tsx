import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:px-4">
      <SidebarTrigger className="text-foreground" />

      <div className="ml-1 hidden md:block">
        <h1 className="text-sm font-medium text-muted-foreground">
          Welcome back, <span className="text-foreground">{user.full_name.split(" ")[0]}</span>
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <StatusBadge label={user.role} variant={statusToVariant(user.role)} className="hidden sm:inline-flex" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground"
            >
              {user.full_name.charAt(0)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user.full_name}</div>
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
              <div className="mt-1 sm:hidden">
                <StatusBadge label={user.role} variant={statusToVariant(user.role)} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
