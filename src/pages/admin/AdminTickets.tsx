import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees, useReassignTicket, useTickets, useUpdateTicketState } from "@/hooks/useStaffArcData";
import type { TicketPriority, TicketState } from "@/types";

const STATES: TicketState[] = ["New", "In Progress", "Resolved", "Closed"];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];

export default function AdminTickets() {
  const { data: tickets = [] } = useTickets();
  const { data: employees = [] } = useEmployees();
  const reassign = useReassignTicket();
  const setState = useUpdateTicketState();

  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(() => tickets.filter((t) => {
    if (stateFilter !== "all" && t.state !== stateFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (q && !(`${t.title} ${t.ticket_number} ${t.category}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [tickets, q, stateFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">All tickets</h1>
        <p className="text-sm text-muted-foreground">Manage and reassign tickets across the organization.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input className="max-w-xs" placeholder="Search title, number, category..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length} tickets</span>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
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
                    <Select value={t.assigned_to} onValueChange={(v) => reassign.mutate({ id: t.id, employeeId: v })}>
                      <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => <SelectItem key={e.id} value={e.id} className="text-xs">{e.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
