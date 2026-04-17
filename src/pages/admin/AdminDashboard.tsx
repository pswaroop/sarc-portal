import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import {
  useDailyUpdates,
  useEmployees,
  useFinancials,
  useProjects,
  useTickets,
} from "@/hooks/useStaffArcData";
import { Briefcase, DollarSign, Ticket as TicketIcon, Users } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: employees = [] } = useEmployees();
  const { data: projects = [] } = useProjects();
  const { data: tickets = [] } = useTickets();
  const { data: financials = [] } = useFinancials();
  const { data: updates = [] } = useDailyUpdates();

  const openTickets = tickets.filter((t) => t.state === "New" || t.state === "In Progress").length;
  const portfolioWorth = useMemo(
    () => financials.reduce((sum, f) => sum + f.project_worth, 0),
    [financials]
  );

  const employeeName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  // Activity feed: latest blockers + ticket changes (mock)
  const feed = [
    ...updates.slice(0, 4).map((u) => ({
      id: `upd-${u.id}`,
      when: u.date,
      text: `${employeeName(u.employee_id)} submitted update on ${projectName(u.project_id)}${u.has_blocker ? " — flagged blocker" : ""}`,
      variant: u.has_blocker ? "destructive" : "info",
    })),
    ...tickets.slice(0, 3).map((t) => ({
      id: `tic-${t.id}`,
      when: t.created_at,
      text: `${t.ticket_number} · ${t.title} (${t.priority})`,
      variant: statusToVariant(t.state),
    })),
  ].sort((a, b) => (a.when < b.when ? 1 : -1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Global overview</h1>
        <p className="text-sm text-muted-foreground">Org-wide health across people, projects, and revenue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total employees" value={employees.length} icon={Users} variant="info" />
        <KpiCard label="Total projects" value={projects.length} icon={Briefcase} variant="primary" />
        <KpiCard label="Open tickets" value={openTickets} icon={TicketIcon} variant="warning" />
        <KpiCard
          label="Portfolio worth"
          value={`$${(portfolioWorth / 1000).toFixed(0)}k`}
          icon={DollarSign}
          variant="success"
          hint={`${financials.length} clients`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Recent activity</h2>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {feed.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="text-sm">{f.text}</div>
                  <span className="shrink-0 text-xs text-muted-foreground">{format(new Date(f.when), "MMM d")}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Project status</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border bg-card/40 px-3 py-2 text-sm">
                <span className="truncate">{p.name}</span>
                <StatusBadge label={p.status} variant={statusToVariant(p.status)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
