import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAssignments, useEmployees } from "@/hooks/useStaffArcData";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInCalendarDays } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function elapsedPercent(start: string, end: string): number {
  const total = differenceInCalendarDays(new Date(end), new Date(start));
  const done = differenceInCalendarDays(new Date(), new Date(start));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

export default function ManagerPerformance() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: employees = [] } = useEmployees();

  const data = useMemo(() => {
    const scoped = user?.role === "Team Lead"
      ? assignments.filter((a) => a.reporting_lead_id === user.id)
      : assignments;

    // Aggregate per employee (avg of expected vs actual across their assignments)
    const byEmp = new Map<string, { expected: number; actual: number; count: number }>();
    scoped.forEach((a) => {
      const cur = byEmp.get(a.employee_id) ?? { expected: 0, actual: 0, count: 0 };
      cur.expected += elapsedPercent(a.start_date, a.end_date);
      cur.actual += a.completion_percentage;
      cur.count += 1;
      byEmp.set(a.employee_id, cur);
    });

    return Array.from(byEmp.entries()).map(([empId, v]) => {
      const expected = Math.round(v.expected / v.count);
      const actual = Math.round(v.actual / v.count);
      const variance = actual - expected;
      return {
        name: employees.find((e) => e.id === empId)?.full_name.split(" ")[0] ?? empId,
        expected,
        actual,
        variance,
      };
    });
  }, [assignments, employees, user]);

  const colorFor = (variance: number) => {
    if (variance >= 0) return "hsl(var(--success))";
    if (variance >= -20) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Performance</h1>
        <p className="text-sm text-muted-foreground">Expected progress vs actual progress per team member.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">Expected vs Actual progress</h2>
          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-muted-foreground/60" /> Expected</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-success" /> On track</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-warning" /> Behind</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-destructive" /> Lagging</span>
          </div>
        </CardHeader>
        <CardContent className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: -16 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="expected" name="Expected" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={colorFor(d.variance)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
