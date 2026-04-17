import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useEmployees, useUpdateUserRole } from "@/hooks/useStaffArcData";
import type { Role } from "@/types";
import { toast } from "@/hooks/use-toast";

const ROLES: Role[] = ["Admin", "Manager", "Team Lead", "Employee"];

export default function AdminUsers() {
  const { data: employees = [] } = useEmployees();
  const updateRole = useUpdateUserRole();

  const handleRoleChange = (id: string, role: Role, name: string) => {
    updateRole.mutate(
      { id, role },
      {
        onSuccess: () => toast({ title: "Role updated", description: `${name} → ${role}` }),
        onError: (e: Error) =>
          toast({ title: "Failed to update role", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Users</h1>
        <p className="text-sm text-muted-foreground">
          User directory with inline role management. Invite new users from Supabase → Authentication.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">Directory</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Current role</TableHead>
                <TableHead>Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.employee_code ?? "—"}</TableCell>
                  <TableCell className="font-medium">{e.full_name}</TableCell>
                  <TableCell className="text-sm">{e.primary_skill ?? "—"}</TableCell>
                  <TableCell><StatusBadge label={e.role} variant={statusToVariant(e.role)} /></TableCell>
                  <TableCell>
                    <Select value={e.role} onValueChange={(v) => handleRoleChange(e.id, v as Role, e.full_name)}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No users yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {employees.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
            {employees.map((e) => (
              <div key={e.id} className="rounded-lg border bg-card/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{e.full_name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{e.employee_code ?? "—"} · {e.primary_skill ?? "—"}</div>
                  </div>
                  <StatusBadge label={e.role} variant={statusToVariant(e.role)} />
                </div>
                <div className="mt-3">
                  <Select value={e.role} onValueChange={(v) => handleRoleChange(e.id, v as Role, e.full_name)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
