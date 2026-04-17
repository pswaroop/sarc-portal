import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees, useReassignTicket, useTickets, useUpdateTicketState } from "@/hooks/useStaffArcData";
import type { TicketPriority, TicketState } from "@/types";

const STATES: TicketState[] = ["New", "In Progress", "On Hold", "Resolved", "Closed"];
const PRIORITIES: TicketPriority[] = ["Low", "Moderate", "High", "Critical"];

export default function AdminTickets() {
  const { data: tickets = [] } = useTickets();
  const { data: employees = [] } = useEmployees();
  const reassign = useReassignTicket();
  const setState = useUpdateTicketState();

  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (stateFilter !== "all" && t.state !== stateFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (q && !`${t.title} ${t.ticket_number} ${t.category}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [tickets, q, stateFilter, priorityFilter]
  );

  const empName = (id: string | null) =>
    id ? employees.find((e) => e.id === id)?.full_name ?? "—" : "Unassigned";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">All tickets</h1>
        <p className="text-sm text-muted-foreground">Manage and reassign tickets across the organization.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="w-full sm:max-w-xs"
              placeholder="Search title, number, category..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {PRIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground sm:ml-auto">{filtered.length} tickets</span>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.ticket_number}</TableCell>
                  <TableCell className="max-w-xs truncate">{t.title}</TableCell>
                  <TableCell><StatusBadge label={t.category} variant="neutral" /></TableCell>
                  <TableCell><StatusBadge label={t.priority} variant={statusToVariant(t.priority)} /></TableCell>
                  <TableCell>
                    <Select value={t.state} onValueChange={(v) => setState.mutate({ id: t.id, state: v as TicketState })}>
                      <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={t.assigned_to ?? undefined}
                      onValueChange={(v) => reassign.mutate({ id: t.id, employeeId: v })}
                    >
                      <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => <SelectItem key={e.id} value={e.id} className="text-xs">{e.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No tickets match.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filtered.length === 0 && <p className="text-sm text-muted-foreground">No tickets match.</p>}
            {filtered.map((t) => (
              <div key={t.id} className="rounded-lg border bg-card/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-muted-foreground">{t.ticket_number}</div>
                    <div className="truncate text-sm font-medium">{t.title}</div>
                  </div>
                  <StatusBadge label={t.priority} variant={statusToVariant(t.priority)} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="mb-1 text-muted-foreground">State</div>
                    <Select value={t.state} onValueChange={(v) => setState.mutate({ id: t.id, state: v as TicketState })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-1 text-muted-foreground">Assignee</div>
                    <Select value={t.assigned_to ?? undefined} onValueChange={(v) => reassign.mutate({ id: t.id, employeeId: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => <SelectItem key={e.id} value={e.id} className="text-xs">{e.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {t.category} · {empName(t.assigned_to)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
