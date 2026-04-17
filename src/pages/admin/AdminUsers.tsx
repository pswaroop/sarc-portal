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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">User directory with inline role management.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-base font-semibold">Directory</h2>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Current role</TableHead>
                <TableHead>Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.employee_code}</TableCell>
                  <TableCell className="font-medium">{e.full_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.email}</TableCell>
                  <TableCell className="text-sm">{e.primary_skill}</TableCell>
                  <TableCell><StatusBadge label={e.role} variant={statusToVariant(e.role)} /></TableCell>
                  <TableCell>
                    <Select
                      value={e.role}
                      onValueChange={(v) => {
                        updateRole.mutate({ id: e.id, role: v as Role });
                        toast({ title: `Role updated`, description: `${e.full_name} → ${v}` });
                      }}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
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
