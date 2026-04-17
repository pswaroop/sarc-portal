import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAssignments, useEmployees, useProjects } from "@/hooks/useStaffArcData";
import { format } from "date-fns";
import { CheckCircle2, MessageSquare } from "lucide-react";

export default function EmployeeProjects() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: projects = [] } = useProjects();
  const { data: employees = [] } = useEmployees();

  const my = useMemo(() => assignments.filter((a) => a.employee_id === user?.id), [assignments, user]);
  const project = (id: string) => projects.find((p) => p.id === id);
  const lead = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My projects</h1>
        <p className="text-sm text-muted-foreground">Detailed view of your assignments and lead feedback.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {my.map((a) => {
          const p = project(a.project_id);
          return (
            <Card key={a.id} className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p?.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Lead: {lead(a.reporting_lead_id)} · Due {format(new Date(a.end_date), "MMM d")}
                    </p>
                  </div>
                  <StatusBadge label={p?.status ?? "—"} variant={statusToVariant(p?.status ?? "")} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{a.completion_percentage}%</span>
                  </div>
                  <Progress value={a.completion_percentage} className="h-2" />
                </div>

                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Features
                  </div>
                  <ul className="space-y-1.5">
                    {a.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" /> Lead comments
                  </div>
                  <p className="text-sm">{a.lead_comments}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {my.length === 0 && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No assigned projects.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
