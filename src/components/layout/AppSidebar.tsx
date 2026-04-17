import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth, canAccess } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
import {
  LayoutDashboard,
  FolderKanban,
  Ticket,
  CalendarCheck,
  Users,
  ShieldCheck,
  BarChart3,
  Briefcase,
  LifeBuoy,
} from "lucide-react";
import type { Role } from "@/types";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "My Workspace",
    items: [
      { title: "Overview", url: "/dashboard/employee", icon: LayoutDashboard, roles: ["Admin", "Manager", "Team Lead", "Employee"] },
      { title: "My Projects", url: "/dashboard/employee/projects", icon: FolderKanban, roles: ["Admin", "Manager", "Team Lead", "Employee"] },
      { title: "My Tickets", url: "/dashboard/employee/tickets", icon: Ticket, roles: ["Admin", "Manager", "Team Lead", "Employee"] },
      { title: "Attendance", url: "/dashboard/employee/attendance", icon: CalendarCheck, roles: ["Admin", "Manager", "Team Lead", "Employee"] },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Team Overview", url: "/dashboard/manager", icon: Users, roles: ["Admin", "Manager", "Team Lead"] },
      { title: "Performance", url: "/dashboard/manager/performance", icon: BarChart3, roles: ["Admin", "Manager", "Team Lead"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Global Overview", url: "/dashboard/admin", icon: ShieldCheck, roles: ["Admin"] },
      { title: "Projects Registry", url: "/dashboard/admin/projects", icon: Briefcase, roles: ["Admin"] },
      { title: "All Tickets", url: "/dashboard/admin/tickets", icon: LifeBuoy, roles: ["Admin"] },
      { title: "Users", url: "/dashboard/admin/users", icon: Users, roles: ["Admin"] },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const role = user?.role;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        {collapsed ? <BrandLogo size={28} withWordmark={false} /> : <BrandLogo size={28} />}
      </SidebarHeader>

      <SidebarContent className="py-2">
        {sections.map((section) => {
          const visible = section.items.filter((i) => canAccess(role, i.roles));
          if (visible.length === 0) return null;
          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          end
                          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-2 text-xs">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-primary-foreground font-semibold">
              {user.full_name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-sidebar-foreground">{user.full_name}</div>
              <div className="truncate text-muted-foreground">{user.role}</div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
