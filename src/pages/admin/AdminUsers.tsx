// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { useEmployees, useUpdateUserRole } from "@/hooks/useStaffArcData";
// import type { Role } from "@/types";
// import { toast } from "@/hooks/use-toast";

// const ROLES: Role[] = ["Admin", "Manager", "Team Lead", "Employee"];

// export default function AdminUsers() {
//   const { data: employees = [] } = useEmployees();
//   const updateRole = useUpdateUserRole();

//   const handleRoleChange = (id: string, role: Role, name: string) => {
//     updateRole.mutate(
//       { id, role },
//       {
//         onSuccess: () => toast({ title: "Role updated", description: `${name} → ${role}` }),
//         onError: (e: Error) =>
//           toast({ title: "Failed to update role", description: e.message, variant: "destructive" }),
//       }
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-xl font-semibold sm:text-2xl">Users</h1>
//         <p className="text-sm text-muted-foreground">
//           User directory with inline role management. Invite new users from Supabase → Authentication.
//         </p>
//       </div>

//       <Card>
//         <CardHeader className="pb-2">
//           <h2 className="text-base font-semibold">Directory</h2>
//         </CardHeader>
//         <CardContent className="overflow-x-auto p-0">
//           <Table className="hidden md:table">
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Code</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Skill</TableHead>
//                 <TableHead>Current role</TableHead>
//                 <TableHead>Change role</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {employees.map((e) => (
//                 <TableRow key={e.id}>
//                   <TableCell className="font-mono text-xs">{e.employee_code ?? "—"}</TableCell>
//                   <TableCell className="font-medium">{e.full_name}</TableCell>
//                   <TableCell className="text-sm">{e.primary_skill ?? "—"}</TableCell>
//                   <TableCell><StatusBadge label={e.role} variant={statusToVariant(e.role)} /></TableCell>
//                   <TableCell>
//                     <Select value={e.role} onValueChange={(v) => handleRoleChange(e.id, v as Role, e.full_name)}>
//                       <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
//                       <SelectContent>
//                         {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {employees.length === 0 && (
//                 <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No users yet.</TableCell></TableRow>
//               )}
//             </TableBody>
//           </Table>

//           {/* Mobile cards */}
//           <div className="space-y-3 p-4 md:hidden">
//             {employees.length === 0 && <p className="text-sm text-muted-foreground">No users yet.</p>}
//             {employees.map((e) => (
//               <div key={e.id} className="rounded-lg border bg-card/40 p-3">
//                 <div className="flex items-start justify-between gap-2">
//                   <div className="min-w-0">
//                     <div className="truncate font-medium">{e.full_name}</div>
//                     <div className="font-mono text-xs text-muted-foreground">{e.employee_code ?? "—"} · {e.primary_skill ?? "—"}</div>
//                   </div>
//                   <StatusBadge label={e.role} variant={statusToVariant(e.role)} />
//                 </div>
//                 <div className="mt-3">
//                   <Select value={e.role} onValueChange={(v) => handleRoleChange(e.id, v as Role, e.full_name)}>
//                     <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, UserPlus } from "lucide-react";
import {
  useEmployees,
  useUpdateUserRole,
  useUpdateEmployee,
} from "@/hooks/useStaffArcData";
import type { Role, Employee } from "@/types";
import { toast } from "@/hooks/use-toast";

const ROLES: Role[] = ["Admin", "Manager", "Team Lead", "Employee"];

export default function AdminUsers() {
  const { data: employees = [] } = useEmployees();
  const updateRole = useUpdateUserRole();
  const updateEmployee = useUpdateEmployee();

  const [editOpen, setEditOpen] = useState(false);
  const [draftUser, setDraftUser] = useState<Partial<Employee> | null>(null);

  const handleRoleChange = (id: string, role: Role, name: string) => {
    updateRole.mutate(
      { id, role },
      {
        onSuccess: () =>
          toast({ title: "Role updated", description: `${name} → ${role}` }),
        onError: (e: Error) =>
          toast({
            title: "Failed to update role",
            description: e.message,
            variant: "destructive",
          }),
      },
    );
  };

  const openEdit = (emp: Employee) => {
    setDraftUser(emp);
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!draftUser || !draftUser.id) return;
    await updateEmployee.mutateAsync({
      id: draftUser.id,
      payload: {
        employee_code: draftUser.employee_code,
        primary_skill: draftUser.primary_skill,
        full_name: draftUser.full_name,
      },
    });
    toast({ title: "Profile updated" });
    setEditOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage profiles and roles.{" "}
            <span className="text-primary font-medium">
              To add a new user, invite them from the Supabase Auth Dashboard.
            </span>
          </p>
        </div>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">
                    {e.employee_code ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium">{e.full_name}</TableCell>
                  <TableCell className="text-sm">
                    {e.primary_skill ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={e.role}
                      variant={statusToVariant(e.role)}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={e.role}
                      onValueChange={(v) =>
                        handleRoleChange(e.id, v as Role, e.full_name)
                      }
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee Profile</DialogTitle>
          </DialogHeader>
          {draftUser && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={draftUser.full_name || ""}
                  onChange={(e) =>
                    setDraftUser({ ...draftUser, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Employee Code</Label>
                <Input
                  value={draftUser.employee_code || ""}
                  onChange={(e) =>
                    setDraftUser({
                      ...draftUser,
                      employee_code: e.target.value,
                    })
                  }
                  placeholder="e.g. EMP-001"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Primary Skill</Label>
                <Input
                  value={draftUser.primary_skill || ""}
                  onChange={(e) =>
                    setDraftUser({
                      ...draftUser,
                      primary_skill: e.target.value,
                    })
                  }
                  placeholder="e.g. React Developer"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
