import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  useAssignments,
  useCreateAssignment,
  useEmployees,
  useFinancials,
  useProjects,
  useUpdateFinancial,
} from "@/hooks/useStaffArcData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, UserPlus } from "lucide-react";
import type { BillingType, PaymentStatus, ProjectFinancial } from "@/types";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const BILLING: BillingType[] = ["Fixed Price", "Time & Material", "Retainer"];
const PAYMENT: PaymentStatus[] = ["Pending", "Partial", "Paid"];

export default function AdminProjects() {
  const { data: projects = [] } = useProjects();
  const { data: financials = [] } = useFinancials();
  const { data: employees = [] } = useEmployees();
  const { data: assignments = [] } = useAssignments();
  const updateFinancial = useUpdateFinancial();
  const createAssignment = useCreateAssignment();

  const finByProject = useMemo(() => {
    const m = new Map<string, ProjectFinancial>();
    financials.forEach((f) => m.set(f.project_id, f));
    return m;
  }, [financials]);

  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectFinancial | null>(null);

  const [assignProjectId, setAssignProjectId] = useState<string | null>(null);
  const [assignEmpId, setAssignEmpId] = useState<string>("");
  const [assignLeadId, setAssignLeadId] = useState<string>("");
  const [assignAlloc, setAssignAlloc] = useState<number>(50);

  const openEdit = (projectId: string) => {
    const existing = finByProject.get(projectId);
    setDraft(
      existing ?? {
        project_id: projectId,
        client_name: "",
        client_contact_person: null,
        client_email: null,
        project_worth: 0,
        currency: "INR",
        billing_type: "Fixed Price",
        payment_status: "Pending",
      }
    );
    setEditProjectId(projectId);
  };

  const saveEdit = async () => {
    if (!draft) return;
    await updateFinancial.mutateAsync(draft);
    toast({ title: "Financials updated" });
    setEditProjectId(null);
  };

  const openAssign = (projectId: string) => {
    setAssignProjectId(projectId);
    setAssignEmpId("");
    setAssignLeadId("");
    setAssignAlloc(50);
  };

  const saveAssign = async () => {
    if (!assignProjectId || !assignEmpId || !assignLeadId) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const project = projects.find((p) => p.id === assignProjectId)!;
    await createAssignment.mutateAsync({
      project_id: assignProjectId,
      employee_id: assignEmpId,
      reporting_lead_id: assignLeadId,
      allocation_percentage: assignAlloc,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: project.deadline,
      completion_percentage: 0,
      latest_status: null,
      features: "",
      lead_comments: "",
    });
    toast({ title: "Employee assigned" });
    setAssignProjectId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Projects registry</h1>
        <p className="text-sm text-muted-foreground">Manage projects, financials, and team assignments.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">All projects</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {/* Desktop table */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Worth</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => {
                const fin = finByProject.get(p.id);
                const team = assignments.filter((a) => a.project_id === p.id).length;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><StatusBadge label={p.status} variant={statusToVariant(p.status)} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fin?.client_name ?? "—"}</TableCell>
                    <TableCell>{fin && fin.project_worth != null ? `${fin.currency} ${Number(fin.project_worth).toLocaleString()}` : "—"}</TableCell>
                    <TableCell className="text-sm">{fin?.billing_type ?? "—"}</TableCell>
                    <TableCell>{fin?.payment_status ? <StatusBadge label={fin.payment_status} variant={statusToVariant(fin.payment_status)} /> : "—"}</TableCell>
                    <TableCell>{team}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.deadline ? format(new Date(p.deadline), "MMM d, yyyy") : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => openAssign(p.id)}><UserPlus className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {projects.length === 0 && (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">No projects yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
            {projects.map((p) => {
              const fin = finByProject.get(p.id);
              const team = assignments.filter((a) => a.project_id === p.id).length;
              return (
                <div key={p.id} className="rounded-lg border bg-card/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{fin?.client_name ?? "—"}</div>
                    </div>
                    <StatusBadge label={p.status} variant={statusToVariant(p.status)} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Worth: </span>{fin?.project_worth != null ? `${fin.currency} ${Number(fin.project_worth).toLocaleString()}` : "—"}</div>
                    <div><span className="text-muted-foreground">Team: </span>{team}</div>
                    <div><span className="text-muted-foreground">Billing: </span>{fin?.billing_type ?? "—"}</div>
                    <div><span className="text-muted-foreground">Due: </span>{p.deadline ? format(new Date(p.deadline), "MMM d") : "—"}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p.id)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openAssign(p.id)}><UserPlus className="mr-1 h-3.5 w-3.5" /> Assign</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editProjectId} onOpenChange={(o) => !o && setEditProjectId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Project financials</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Client name</Label>
                <Input value={draft.client_name} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Worth</Label>
                  <Input type="number" value={draft.project_worth ?? 0} onChange={(e) => setDraft({ ...draft, project_worth: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Billing</Label>
                  <Select value={draft.billing_type ?? undefined} onValueChange={(v) => setDraft({ ...draft, billing_type: v as BillingType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BILLING.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Payment</Label>
                  <Select value={draft.payment_status ?? undefined} onValueChange={(v) => setDraft({ ...draft, payment_status: v as PaymentStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Contact person</Label>
                <Input value={draft.client_contact_person ?? ""} onChange={(e) => setDraft({ ...draft, client_contact_person: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Contact email</Label>
                <Input type="email" value={draft.client_email ?? ""} onChange={(e) => setDraft({ ...draft, client_email: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectId(null)}>Cancel</Button>
            <Button className="bg-gradient-brand text-primary-foreground" onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignProjectId} onOpenChange={(o) => !o && setAssignProjectId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign employee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={assignEmpId} onValueChange={setAssignEmpId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name} · {e.role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reporting lead</Label>
              <Select value={assignLeadId} onValueChange={setAssignLeadId}>
                <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                <SelectContent>
                  {employees.filter((e) => e.role === "Team Lead" || e.role === "Manager")
                    .map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name} · {e.role}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Allocation (%)</Label>
              <Input type="number" min={0} max={100} value={assignAlloc} onChange={(e) => setAssignAlloc(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignProjectId(null)}>Cancel</Button>
            <Button className="bg-gradient-brand text-primary-foreground" onClick={saveAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
