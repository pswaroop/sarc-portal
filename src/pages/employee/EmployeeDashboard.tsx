import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAssignments, useProjects, useSubmitDailyUpdate, useTickets } from "@/hooks/useStaffArcData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarDays, AlertTriangle, Ticket as TicketIcon } from "lucide-react";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: projects = [] } = useProjects();
  const { data: tickets = [] } = useTickets();
  const submit = useSubmitDailyUpdate();

  const myAssignments = useMemo(
    () => assignments.filter((a) => a.employee_id === user?.id),
    [assignments, user]
  );
  const myTickets = useMemo(
    () => tickets.filter((t) => t.assigned_to === user?.id).slice(0, 5),
    [tickets, user]
  );
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  // Daily update form state
  const [projectId, setProjectId] = useState<string>(myAssignments[0]?.project_id ?? "");
  const [completed, setCompleted] = useState("");
  const [inProgress, setInProgress] = useState("");
  const [planned, setPlanned] = useState("");
  const [hasBlocker, setHasBlocker] = useState(false);
  const [blocker, setBlocker] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId) return;
    await submit.mutateAsync({
      employee_id: user.id,
      project_id: projectId,
      date: new Date().toISOString().slice(0, 10),
      completed,
      in_progress: inProgress,
      planned,
      has_blocker: hasBlocker,
      blocker_description: hasBlocker ? blocker : undefined,
    });
    toast({ title: "Update submitted", description: "Your daily update was saved." });
    setCompleted(""); setInProgress(""); setPlanned(""); setHasBlocker(false); setBlocker("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Workspace</h1>
        <p className="text-sm text-muted-foreground">Your active assignments, tickets, and daily check-in.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Active assignments + tickets */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-base font-semibold">Active assignments</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {myAssignments.length === 0 && (
                <p className="text-sm text-muted-foreground">No active assignments.</p>
              )}
              {myAssignments.map((a) => {
                const project = projects.find((p) => p.id === a.project_id);
                return (
                  <div key={a.id} className="rounded-lg border bg-card/50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{project?.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <CalendarDays className="h-3 w-3" />
                          Due {format(new Date(a.end_date), "MMM d, yyyy")}
                          <span>· {a.allocation_percentage}% allocation</span>
                        </div>
                      </div>
                      <StatusBadge label={`${a.completion_percentage}%`} variant="primary" />
                    </div>
                    <Progress value={a.completion_percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <TicketIcon className="h-4 w-4" /> Recent tickets
              </h2>
            </CardHeader>
            <CardContent>
              {myTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets assigned.</p>
              ) : (
                <ul className="divide-y">
                  {myTickets.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">{t.ticket_number}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge label={t.priority} variant={statusToVariant(t.priority)} />
                        <StatusBadge label={t.state} variant={statusToVariant(t.state)} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Submit daily update */}
        <Card className="lg:sticky lg:top-20 h-fit">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Submit daily update</h2>
            <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {myAssignments.map((a) => (
                      <SelectItem key={a.project_id} value={a.project_id}>{projectName(a.project_id)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Completed</Label>
                <Textarea rows={2} value={completed} onChange={(e) => setCompleted(e.target.value)} placeholder="What did you ship today?" />
              </div>
              <div className="space-y-1.5">
                <Label>In progress</Label>
                <Textarea rows={2} value={inProgress} onChange={(e) => setInProgress(e.target.value)} placeholder="What are you currently working on?" />
              </div>
              <div className="space-y-1.5">
                <Label>Planned</Label>
                <Textarea rows={2} value={planned} onChange={(e) => setPlanned(e.target.value)} placeholder="What's next?" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <Label htmlFor="blk" className="cursor-pointer">Has blocker?</Label>
                </div>
                <Switch id="blk" checked={hasBlocker} onCheckedChange={setHasBlocker} />
              </div>
              {hasBlocker && (
                <Textarea rows={2} value={blocker} onChange={(e) => setBlocker(e.target.value)} placeholder="Describe the blocker..." required />
              )}
              <Button type="submit" disabled={submit.isPending} className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">
                {submit.isPending ? "Submitting..." : "Submit update"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
