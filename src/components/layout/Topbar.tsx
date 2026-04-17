import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Role } from "@/types";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";

const ROLES: Role[] = ["Admin", "Manager", "Team Lead", "Employee"];

export function Topbar() {
  const { user, logout, setRole } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="text-foreground" />

      <div className="ml-1 hidden md:block">
        <h1 className="text-sm font-medium text-muted-foreground">
          Welcome back, <span className="text-foreground">{user.full_name.split(" ")[0]}</span>
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dev role switcher — preview each role without auth */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-muted-foreground">View as</span>
          <Select value={user.role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <StatusBadge label={user.role} variant={statusToVariant(user.role)} />

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
              {user.full_name.charAt(0)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user.full_name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
