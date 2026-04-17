import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Users, Briefcase, AlertOctagon, AlertTriangle } from "lucide-react";
import {
  useAssignments,
  useDailyUpdates,
  useEmployees,
  useProjects,
} from "@/hooks/useStaffArcData";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInCalendarDays, format } from "date-fns";

function elapsedPercent(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const total = differenceInCalendarDays(new Date(end), new Date(start));
  const done = differenceInCalendarDays(new Date(), new Date(start));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: projects = [] } = useProjects();
  const { data: employees = [] } = useEmployees();
  const { data: updates = [] } = useDailyUpdates();

  const scoped = useMemo(() => {
    if (!user) return assignments;
    if (user.role === "Team Lead") return assignments.filter((a) => a.reporting_lead_id === user.id);
    return assignments;
  }, [assignments, user]);

  const teamIds = new Set(scoped.map((a) => a.employee_id));
  const teamSize = teamIds.size;
  const activeAssignments = scoped.length;

  const blockers = updates.filter((u) => u.has_blocker && (user?.role !== "Team Lead" || teamIds.has(u.employee_id)));
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";
  const employeeName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

  const tracked = scoped.map((a) => {
    const elapsed = elapsedPercent(a.start_date, a.end_date);
    const variance = a.completion_percentage - elapsed;
    return { ...a, elapsed, variance };
  });

  const atRisk = tracked.filter((t) => t.variance <= -20).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Team overview</h1>
        <p className="text-sm text-muted-foreground">Track delivery health and surface blockers across your team.</p>
      </div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Team size" value={teamSize} icon={Users} variant="info" />
        <KpiCard label="Active" value={activeAssignments} icon={Briefcase} variant="primary" />
        <KpiCard label="Blockers" value={blockers.length} icon={AlertOctagon} variant="destructive" hint="Needs attention" />
        <KpiCard label="At risk" value={atRisk} icon={AlertTriangle} variant="warning" hint=">20% behind" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Automated progress tracker</h2>
            <p className="text-xs text-muted-foreground">Compares time elapsed vs actual completion. Flags &gt;20% lag.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tracked.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            {tracked.map((t) => {
              const lagging = t.variance <= -20;
              return (
                <div key={t.id} className="rounded-lg border bg-card/40 p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{projectName(t.project_id)}</div>
                      <div className="text-xs text-muted-foreground">
                        {employeeName(t.employee_id)}{t.end_date && ` · Due ${format(new Date(t.end_date), "MMM d")}`}
                      </div>
                    </div>
                    {lagging ? (
                      <StatusBadge label={`Lagging ${Math.abs(t.variance)}%`} variant="destructive" />
                    ) : t.variance >= 0 ? (
                      <StatusBadge label="On track" variant="success" />
                    ) : (
                      <StatusBadge label={`${Math.abs(t.variance)}% behind`} variant="warning" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Time elapsed</span><span>{t.elapsed}%</span>
                      </div>
                      <Progress value={t.elapsed} className="h-1.5 [&>div]:bg-muted-foreground/60" />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Actual completion</span><span>{t.completion_percentage}%</span>
                      </div>
                      <Progress
                        value={t.completion_percentage}
                        className={`h-1.5 ${lagging ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Action center</h2>
            <p className="text-xs text-muted-foreground">Recent blockers from your team.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockers.length === 0 && <p className="text-sm text-muted-foreground">No active blockers 🎉</p>}
            {blockers.map((b) => (
              <div key={b.id} className="rounded-lg border-l-2 border-destructive bg-destructive/5 p-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{employeeName(b.employee_id)}</span>
                  <span className="text-muted-foreground">{format(new Date(b.date), "MMM d")}</span>
                </div>
                <div className="text-xs text-muted-foreground">{projectName(b.project_id)}</div>
                <p className="mt-1 text-sm">{b.blocker_description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
