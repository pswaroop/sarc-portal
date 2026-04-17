import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets, useUpdateTicketState } from "@/hooks/useStaffArcData";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import type { Ticket, TicketState } from "@/types";
import { Button } from "@/components/ui/button";

const COLUMNS: TicketState[] = ["New", "In Progress", "On Hold", "Resolved", "Closed"];

const NEXT_STATE: Record<TicketState, TicketState | null> = {
  New: "In Progress",
  "In Progress": "Resolved",
  "On Hold": "In Progress",
  Resolved: "Closed",
  Closed: null,
};

export default function EmployeeTickets() {
  const { user } = useAuth();
  const { data: tickets = [] } = useTickets();
  const update = useUpdateTicketState();

  const mine = useMemo(() => tickets.filter((t) => t.assigned_to === user?.id), [tickets, user]);
  const grouped = useMemo(() => {
    const map: Record<TicketState, Ticket[]> = {
      New: [], "In Progress": [], "On Hold": [], Resolved: [], Closed: [],
    };
    mine.forEach((t) => map[t.state].push(t));
    return map;
  }, [mine]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">My tickets</h1>
        <p className="text-sm text-muted-foreground">Move tickets through the workflow as you work.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => (
          <Card key={col} className="bg-card/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{col}</h2>
                <span className="text-xs text-muted-foreground">{grouped[col].length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {grouped[col].map((t) => {
                const next = NEXT_STATE[t.state];
                return (
                  <div key={t.id} className="rounded-lg border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-mono text-[11px] text-muted-foreground">{t.ticket_number}</div>
                      <StatusBadge label={t.priority} variant={statusToVariant(t.priority)} />
                    </div>
                    <div className="mt-1 text-sm font-medium">{t.title}</div>
                    {t.description && (
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.description}</div>
                    )}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <StatusBadge label={t.category} variant="neutral" />
                      {next && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 shrink-0 text-xs"
                          onClick={() => update.mutate({ id: t.id, state: next })}
                        >
                          → {next}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {grouped[col].length === 0 && (
                <p className="text-xs text-muted-foreground">Nothing here.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
