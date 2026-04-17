import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import {
  useAssignments,
  useAttendance,
  useDailyUpdates,
  useEmployees,
  useProjects,
  useTickets,
} from "@/hooks/useStaffArcData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Gauge,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { differenceInCalendarDays, format, isSameMonth, subDays } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function elapsedPercent(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const total = differenceInCalendarDays(new Date(end), new Date(start));
  const done = differenceInCalendarDays(new Date(), new Date(start));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

export default function ManagerPerformance() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: employees = [] } = useEmployees();
  const { data: updates = [] } = useDailyUpdates();
  const { data: tickets = [] } = useTickets();
  const { data: attendance = [] } = useAttendance();
  const { data: projects = [] } = useProjects();

  const scoped = useMemo(
    () =>
      user?.role === "Team Lead"
        ? assignments.filter((a) => a.reporting_lead_id === user.id)
        : assignments,
    [assignments, user]
  );

  const teamIds = useMemo(() => new Set(scoped.map((a) => a.employee_id)), [scoped]);
  const teamMembers = useMemo(
    () => employees.filter((e) => teamIds.has(e.id)),
    [employees, teamIds]
  );

  // Per-employee aggregates
  const perEmployee = useMemo(() => {
    return teamMembers.map((emp) => {
      const empAssign = scoped.filter((a) => a.employee_id === emp.id);
      const expected =
        empAssign.length > 0
          ? Math.round(
              empAssign.reduce((s, a) => s + elapsedPercent(a.start_date, a.end_date), 0) /
                empAssign.length
            )
          : 0;
      const actual =
        empAssign.length > 0
          ? Math.round(
              empAssign.reduce((s, a) => s + a.completion_percentage, 0) / empAssign.length
            )
          : 0;
      const variance = actual - expected;

      const empUpdates = updates.filter((u) => u.employee_id === emp.id);
      const blockers = empUpdates.filter((u) => u.has_blocker).length;
      const updateCount = empUpdates.length;

      const empTickets = tickets.filter((t) => t.assigned_to === emp.id);
      const ticketsResolved = empTickets.filter(
        (t) => t.state === "Resolved" || t.state === "Closed"
      ).length;
      const ticketsOpen = empTickets.length - ticketsResolved;

      const empAttendance = attendance.filter(
        (a) => a.employee_id === emp.id && isSameMonth(new Date(a.date), new Date())
      );
      const presentDays = empAttendance.filter(
        (a) => a.status === "Present" || a.status === "WFH"
      ).length;

      return {
        id: emp.id,
        name: emp.full_name.split(" ")[0],
        full_name: emp.full_name,
        role: emp.role,
        expected,
        actual,
        variance,
        blockers,
        updateCount,
        ticketsResolved,
        ticketsOpen,
        presentDays,
        // Composite score: completion vs expected, ticket throughput, attendance, low blockers
        score: Math.max(
          0,
          Math.min(
            100,
            Math.round(
              0.5 * actual +
                0.2 * Math.min(100, ticketsResolved * 10) +
                0.2 * Math.min(100, presentDays * 5) -
                5 * blockers
            )
          )
        ),
      };
    });
  }, [teamMembers, scoped, updates, tickets, attendance]);

  // KPI roll-ups
  const kpis = useMemo(() => {
    const onTrack = perEmployee.filter((p) => p.variance >= 0).length;
    const behind = perEmployee.filter((p) => p.variance < 0 && p.variance > -20).length;
    const lagging = perEmployee.filter((p) => p.variance <= -20).length;
    const avgScore = perEmployee.length
      ? Math.round(perEmployee.reduce((s, p) => s + p.score, 0) / perEmployee.length)
      : 0;
    const totalBlockers = perEmployee.reduce((s, p) => s + p.blockers, 0);
    const totalResolved = perEmployee.reduce((s, p) => s + p.ticketsResolved, 0);
    return { onTrack, behind, lagging, avgScore, totalBlockers, totalResolved };
  }, [perEmployee]);

  // Velocity trend (last 14 days of updates)
  const velocity = useMemo(() => {
    const days: { date: string; label: string; updates: number; blockers: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const iso = d.toISOString().slice(0, 10);
      const dayUpdates = updates.filter(
        (u) => u.date === iso && (user?.role !== "Team Lead" || teamIds.has(u.employee_id))
      );
      days.push({
        date: iso,
        label: format(d, "MMM d"),
        updates: dayUpdates.length,
        blockers: dayUpdates.filter((u) => u.has_blocker).length,
      });
    }
    return days;
  }, [updates, teamIds, user]);

  // Project health distribution
  const healthDist = useMemo(() => {
    const onTrack = perEmployee.reduce(
      (s, p) => s + Math.max(0, scoped.filter((a) => a.employee_id === p.id && p.variance >= 0).length),
      0
    );
    const behind = scoped.filter((a) => {
      const e = elapsedPercent(a.start_date, a.end_date);
      const v = a.completion_percentage - e;
      return v < 0 && v > -20;
    }).length;
    const lagging = scoped.filter((a) => {
      const e = elapsedPercent(a.start_date, a.end_date);
      return a.completion_percentage - e <= -20;
    }).length;
    return [
      { name: "On track", value: onTrack, fill: "hsl(var(--success))" },
      { name: "Behind", value: behind, fill: "hsl(var(--warning))" },
      { name: "Lagging", value: lagging, fill: "hsl(var(--destructive))" },
    ].filter((d) => d.value > 0);
  }, [perEmployee, scoped]);

  // Workload (allocation %) per employee
  const workload = useMemo(
    () =>
      perEmployee.map((p) => {
        const total = scoped
          .filter((a) => a.employee_id === p.id)
          .reduce((s, a) => s + (a.allocation_percentage ?? 0), 0);
        return { name: p.name, allocation: Math.min(150, total) };
      }),
    [perEmployee, scoped]
  );

  // Top performers
  const topPerformers = useMemo(
    () => [...perEmployee].sort((a, b) => b.score - a.score).slice(0, 5),
    [perEmployee]
  );

  const colorFor = (variance: number) => {
    if (variance >= 0) return "hsl(var(--success))";
    if (variance >= -20) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Performance</h1>
        <p className="text-sm text-muted-foreground">
          Multi-dimensional view of team delivery, throughput, and engagement.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Avg score" value={`${kpis.avgScore}`} icon={Gauge} variant="primary" hint="0–100" />
        <KpiCard label="On track" value={kpis.onTrack} icon={TrendingUp} variant="success" />
        <KpiCard label="Behind" value={kpis.behind} icon={Clock} variant="warning" />
        <KpiCard label="Lagging" value={kpis.lagging} icon={TrendingDown} variant="destructive" />
        <KpiCard label="Resolved" value={kpis.totalResolved} icon={CheckCircle2} variant="info" hint="tickets" />
        <KpiCard label="Blockers" value={kpis.totalBlockers} icon={Activity} variant="warning" />
      </div>

      {/* Expected vs Actual */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">Expected vs Actual progress</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-muted-foreground/60" /> Expected</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-success" /> On track</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-warning" /> Behind</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-destructive" /> Lagging</span>
          </div>
        </CardHeader>
        <CardContent className="h-[320px] sm:h-[420px]">
          {perEmployee.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No team data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perEmployee} margin={{ top: 16, right: 8, bottom: 8, left: -16 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="expected" name="Expected" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
                  {perEmployee.map((d, i) => (
                    <Cell key={i} fill={colorFor(d.variance)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Velocity + Project health */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Daily updates velocity (14 days)</h2>
            <p className="text-xs text-muted-foreground">Updates submitted vs blockers raised.</p>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocity} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="updates" name="Updates" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="blockers" name="Blockers" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Project health</h2>
            <p className="text-xs text-muted-foreground">Distribution across {scoped.length} assignments.</p>
          </CardHeader>
          <CardContent className="h-[260px]">
            {healthDist.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {healthDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workload + Top performers */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Team workload</h2>
            <p className="text-xs text-muted-foreground">Total allocation % across active assignments.</p>
          </CardHeader>
          <CardContent className="h-[280px]">
            {workload.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workload} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0, 150]} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={70} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="allocation" name="Allocation %" radius={[0, 4, 4, 0]}>
                    {workload.map((w, i) => (
                      <Cell key={i} fill={w.allocation > 100 ? "hsl(var(--destructive))" : w.allocation > 80 ? "hsl(var(--warning))" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Award className="h-4 w-4 text-primary" /> Top performers
            </h2>
            <p className="text-xs text-muted-foreground">Composite score (delivery + throughput + presence).</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length === 0 && <p className="text-sm text-muted-foreground">No data.</p>}
            {topPerformers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{p.full_name}</span>
                    <span className="shrink-0 text-sm font-semibold">{p.score}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-brand transition-all"
                      style={{ width: `${p.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed scorecard */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">Individual scorecard</h2>
          <p className="text-xs text-muted-foreground">Drill-down across delivery, throughput, and engagement.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {perEmployee.length === 0 && <p className="text-sm text-muted-foreground">No team members assigned yet.</p>}
          {perEmployee.map((p) => {
            const status =
              p.variance >= 0 ? { label: "On track", v: "success" as const } :
              p.variance > -20 ? { label: `${Math.abs(p.variance)}% behind`, v: "warning" as const } :
              { label: `Lagging ${Math.abs(p.variance)}%`, v: "destructive" as const };
            return (
              <div key={p.id} className="rounded-lg border bg-card/40 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.full_name}</div>
                    <div className="text-xs text-muted-foreground">{p.role}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={status.label} variant={status.v} />
                    <StatusBadge label={`Score ${p.score}`} variant="primary" />
                  </div>
                </div>
                <div className="grid gap-3 text-xs sm:grid-cols-2 md:grid-cols-5">
                  <Stat label="Expected" value={`${p.expected}%`} />
                  <Stat label="Actual" value={`${p.actual}%`} />
                  <Stat label="Updates" value={p.updateCount} />
                  <Stat label="Tickets resolved" value={p.ticketsResolved} />
                  <Stat label="Blockers raised" value={p.blockers} accent={p.blockers > 0 ? "warning" : undefined} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Footer note for non-managers (defensive) */}
      {projects.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Tip: add projects and assignments to populate these charts.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "warning" | "destructive";
}) {
  return (
    <div className="rounded-md border bg-background/60 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 text-sm font-semibold ${
          accent === "warning" ? "text-warning" : accent === "destructive" ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
