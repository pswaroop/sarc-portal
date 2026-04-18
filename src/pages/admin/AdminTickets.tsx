// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Trash2, Pencil } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import {
//   useEmployees,
//   useReassignTicket,
//   useTickets,
//   useUpdateTicketState,
//   useCreateTicket,
//   useDeleteTicket,
//   useUpdateTicketFull,
// } from "@/hooks/useStaffArcData";
// import { useAuth } from "@/contexts/AuthContext";
// import type { TicketPriority, TicketState, Ticket } from "@/types";

// const STATES: TicketState[] = [
//   "New",
//   "In Progress",
//   "On Hold",
//   "Resolved",
//   "Closed",
// ];
// const PRIORITIES: TicketPriority[] = ["Low", "Moderate", "High", "Critical"];

// export default function AdminTickets() {
//   const { user } = useAuth();
//   const { data: tickets = [] } = useTickets();
//   const { data: employees = [] } = useEmployees();
  
//   const reassign = useReassignTicket();
//   const setState = useUpdateTicketState();
//   const createTicket = useCreateTicket();
//   const deleteTicket = useDeleteTicket();
//   const updateTicketFull = useUpdateTicketFull();

//   // Filters
//   const [q, setQ] = useState("");
//   const [stateFilter, setStateFilter] = useState<string>("all");
//   const [priorityFilter, setPriorityFilter] = useState<string>("all");

//   // Create Modal
//   const [createOpen, setCreateOpen] = useState(false);
//   const [newTicket, setNewTicket] = useState({
//     title: "",
//     description: "",
//     priority: "Moderate" as TicketPriority,
//     category: "Development",
//     assigned_to: "",
//     resolution_notes: "",
//     state: "New" as TicketState,
//   });

//   // Edit Modal
//   const [editTicket, setEditTicket] = useState<Ticket | null>(null);

//   const filtered = useMemo(
//     () =>
//       tickets.filter((t) => {
//         if (stateFilter !== "all" && t.state !== stateFilter) return false;
//         if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
//         if (
//           q &&
//           !`${t.title} ${t.ticket_number} ${t.category}`
//             .toLowerCase()
//             .includes(q.toLowerCase())
//         )
//           return false;
//         return true;
//       }),
//     [tickets, q, stateFilter, priorityFilter],
//   );

//   const handleCreate = async () => {
//     if (!newTicket.title) {
//       toast({ title: "Title required", variant: "destructive" });
//       return;
//     }
//     await createTicket.mutateAsync({
//       ...newTicket,
//       // FIX: Ensure empty string is converted to NULL so database doesn't crash on UUID check
//       assigned_to: newTicket.assigned_to === "unassigned" || !newTicket.assigned_to ? null : newTicket.assigned_to,
//       created_by: user?.id || ""
//     });
//     toast({ title: "Ticket created" });
//     setCreateOpen(false);
//     setNewTicket({
//       title: "",
//       description: "",
//       priority: "Moderate",
//       category: "Development",
//       assigned_to: "",
//       resolution_notes: "",
//       state: "New",
//     });
//   };

//   const handleDelete = async (id: string) => {
//     if (confirm("Are you sure you want to delete this ticket?")) {
//       await deleteTicket.mutateAsync(id);
//       toast({ title: "Ticket deleted" });
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editTicket) return;
//     await updateTicketFull.mutateAsync({
//       id: editTicket.id,
//       title: editTicket.title,
//       description: editTicket.description,
//       priority: editTicket.priority,
//       category: editTicket.category,
//       state: editTicket.state,
//       assigned_to: editTicket.assigned_to === "unassigned" || !editTicket.assigned_to ? null : editTicket.assigned_to,
//       resolution_notes: editTicket.resolution_notes
//     });
//     toast({ title: "Ticket updated successfully" });
//     setEditTicket(null);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//         <div>
//           <h1 className="text-xl font-semibold sm:text-2xl">All tickets</h1>
//           <p className="text-sm text-muted-foreground">
//             Manage and reassign tickets across the organization.
//           </p>
//         </div>
//         <Button onClick={() => setCreateOpen(true)} className="gap-2">
//           <Plus className="h-4 w-4" /> New Ticket
//         </Button>
//       </div>

//       <Card>
//         <CardHeader className="pb-2 space-y-4">
//           {/* Quick Filters */}
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Input
//               placeholder="Search by title, ID, or category..."
//               className="max-w-xs"
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//             />
//             <Select value={stateFilter} onValueChange={setStateFilter}>
//               <SelectTrigger className="w-[140px]">
//                 <SelectValue placeholder="Status filter" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All States</SelectItem>
//                 {STATES.map((s) => (
//                   <SelectItem key={s} value={s}>{s}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//               <SelectTrigger className="w-[140px]">
//                 <SelectValue placeholder="Priority filter" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Priorities</SelectItem>
//                 {PRIORITIES.map((p) => (
//                   <SelectItem key={p} value={p}>{p}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>
        
//         <CardContent className="overflow-x-auto p-0">
//           <Table className="hidden md:table">
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Ticket</TableHead>
//                 <TableHead>Title</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead>Priority</TableHead>
//                 <TableHead>State</TableHead>
//                 <TableHead>Assignee</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.map((t) => (
//                 <TableRow key={t.id}>
//                   <TableCell className="font-mono text-xs">
//                     {t.ticket_number}
//                   </TableCell>
//                   <TableCell className="max-w-xs truncate">{t.title}</TableCell>
//                   <TableCell>
//                     <StatusBadge label={t.category} variant="neutral" />
//                   </TableCell>
//                   <TableCell>
//                     <StatusBadge
//                       label={t.priority}
//                       variant={statusToVariant(t.priority)}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <Select
//                       value={t.state}
//                       onValueChange={(v) =>
//                         setState.mutate({ id: t.id, state: v as TicketState })
//                       }
//                     >
//                       <SelectTrigger className="h-8 w-32 text-xs">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {STATES.map((s) => (
//                           <SelectItem key={s} value={s} className="text-xs">
//                             {s}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                   <TableCell>
//                     <Select
//                       value={t.assigned_to ?? "unassigned"}
//                       onValueChange={(v) => {
//                         const employeeId = v === "unassigned" ? null : v;
//                         reassign.mutate({ id: t.id, employeeId: employeeId as string });
//                       }}
//                     >
//                       <SelectTrigger className="h-8 w-44 text-xs">
//                         <SelectValue placeholder="Unassigned" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="unassigned" className="text-xs">
//                           — Unassigned —
//                         </SelectItem>
//                         {employees.map((e) => (
//                           <SelectItem
//                             key={e.id}
//                             value={e.id}
//                             className="text-xs"
//                           >
//                             {e.full_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       onClick={() => setEditTicket(t)}
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       className="text-destructive hover:text-destructive"
//                       onClick={() => handleDelete(t.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {filtered.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
//                     No tickets found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Edit Full Ticket Modal */}
//       <Dialog open={!!editTicket} onOpenChange={(o) => !o && setEditTicket(null)}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Edit Ticket {editTicket?.ticket_number}</DialogTitle>
//           </DialogHeader>
//           {editTicket && (
//             <div className="grid md:grid-cols-2 gap-6 pt-2">
//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <Label>Title</Label>
//                   <Input value={editTicket.title} onChange={e => setEditTicket({...editTicket, title: e.target.value})} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Description</Label>
//                   <Textarea rows={4} value={editTicket.description || ""} onChange={e => setEditTicket({...editTicket, description: e.target.value})} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <Label>Priority</Label>
//                     <Select value={editTicket.priority} onValueChange={v => setEditTicket({...editTicket, priority: v as TicketPriority})}>
//                       <SelectTrigger><SelectValue/></SelectTrigger>
//                       <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label>Category</Label>
//                     <Input value={editTicket.category} onChange={e => setEditTicket({...editTicket, category: e.target.value})} />
//                   </div>
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 <div className="space-y-1.5">
//                   <Label>Current Status</Label>
//                   <Select value={editTicket.state} onValueChange={v => setEditTicket({...editTicket, state: v as TicketState})}>
//                     <SelectTrigger><SelectValue/></SelectTrigger>
//                     <SelectContent>{STATES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Assigned To</Label>
//                   <Select value={editTicket.assigned_to || "unassigned"} onValueChange={v => setEditTicket({...editTicket, assigned_to: v})}>
//                     <SelectTrigger><SelectValue/></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
//                       {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Resolution Notes & Comments</Label>
//                   <Textarea rows={5} value={editTicket.resolution_notes || ""} onChange={e => setEditTicket({...editTicket, resolution_notes: e.target.value})} placeholder="Add updates or resolution notes here..." />
//                 </div>
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setEditTicket(null)}>Cancel</Button>
//             <Button onClick={handleUpdate}>Save Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Create Ticket Modal */}
//       <Dialog open={createOpen} onOpenChange={setCreateOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create New Ticket</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-3">
//             <div className="space-y-1.5">
//               <Label>Title *</Label>
//               <Input
//                 value={newTicket.title}
//                 onChange={(e) =>
//                   setNewTicket({ ...newTicket, title: e.target.value })
//                 }
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label>Description</Label>
//               <Textarea
//                 value={newTicket.description}
//                 onChange={(e) =>
//                   setNewTicket({ ...newTicket, description: e.target.value })
//                 }
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="space-y-1.5">
//                 <Label>Priority</Label>
//                 <Select
//                   value={newTicket.priority}
//                   onValueChange={(v) =>
//                     setNewTicket({
//                       ...newTicket,
//                       priority: v as TicketPriority,
//                     })
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {PRIORITIES.map((p) => (
//                       <SelectItem key={p} value={p}>
//                         {p}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Category</Label>
//                 <Input
//                   value={newTicket.category}
//                   onChange={(e) =>
//                     setNewTicket({ ...newTicket, category: e.target.value })
//                   }
//                   placeholder="e.g. Development"
//                 />
//               </div>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Assign To (Optional)</Label>
//               <Select
//                 value={newTicket.assigned_to}
//                 onValueChange={(v) =>
//                   setNewTicket({ ...newTicket, assigned_to: v })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Leave unassigned" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="unassigned">— Unassigned —</SelectItem>
//                   {employees.map((e) => (
//                     <SelectItem key={e.id} value={e.id}>
//                       {e.full_name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setCreateOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleCreate}>Create</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useEmployees,
  useReassignTicket,
  useTickets,
  useUpdateTicketState,
  useCreateTicket,
  useDeleteTicket,
  useUpdateTicketFull,
} from "@/hooks/useStaffArcData";
import { useAuth } from "@/contexts/AuthContext";
import type { TicketPriority, TicketState, Ticket } from "@/types";

const STATES: TicketState[] = [
  "New",
  "In Progress",
  "On Hold",
  "Resolved",
  "Closed",
];
const PRIORITIES: TicketPriority[] = ["Low", "Moderate", "High", "Critical"];

export default function AdminTickets() {
  const { user } = useAuth();
  const { data: tickets = [] } = useTickets();
  const { data: employees = [] } = useEmployees();
  
  const reassign = useReassignTicket();
  const setState = useUpdateTicketState();
  const createTicket = useCreateTicket();
  const deleteTicket = useDeleteTicket();
  const updateTicketFull = useUpdateTicketFull();

  // Filters
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "Moderate" as TicketPriority,
    category: "Development",
    assigned_to: "",
    resolution_notes: "",
    state: "New" as TicketState,
  });

  // Edit Modal
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (stateFilter !== "all" && t.state !== stateFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (
          q &&
          !`${t.title} ${t.ticket_number} ${t.category}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      }),
    [tickets, q, stateFilter, priorityFilter],
  );

  const handleCreate = async () => {
    if (!newTicket.title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    await createTicket.mutateAsync({
      ...newTicket,
      // FIX: Ensure empty string is converted to NULL so database doesn't crash on UUID check
      assigned_to: newTicket.assigned_to === "unassigned" || !newTicket.assigned_to ? null : newTicket.assigned_to,
      created_by: user?.id || ""
    });
    toast({ title: "Ticket created" });
    setCreateOpen(false);
    setNewTicket({
      title: "",
      description: "",
      priority: "Moderate",
      category: "Development",
      assigned_to: "",
      resolution_notes: "",
      state: "New",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      await deleteTicket.mutateAsync(id);
      toast({ title: "Ticket deleted" });
    }
  };

  const handleUpdate = async () => {
    if (!editTicket) return;
    await updateTicketFull.mutateAsync({
      id: editTicket.id,
      title: editTicket.title,
      description: editTicket.description,
      priority: editTicket.priority,
      category: editTicket.category,
      state: editTicket.state,
      assigned_to: editTicket.assigned_to === "unassigned" || !editTicket.assigned_to ? null : editTicket.assigned_to,
      resolution_notes: editTicket.resolution_notes
    });
    toast({ title: "Ticket updated successfully" });
    setEditTicket(null);
  };

  return (
    <div className="space-y-6 max-w-full px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">All tickets</h1>
          <p className="text-sm text-muted-foreground">
            Manage and reassign tickets across the organization.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2 space-y-4 border-b bg-muted/10">
          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by title, ID..."
                className="pl-9 w-full bg-background"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background">
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-background">
                  <SelectValue placeholder="Priority filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-x-auto p-0 sm:p-4">
          
          {/* Mobile View */}
          <div className="grid gap-4 md:hidden p-4">
            {filtered.map(t => (
              <div key={t.id} className="flex flex-col gap-3 rounded-lg border p-4 bg-card/50 shadow-sm">
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.ticket_number}</span>
                    <StatusBadge label={t.priority} variant={statusToVariant(t.priority)} />
                  </div>
                  <div className="font-semibold text-[15px] leading-tight mb-1">{t.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <StatusBadge label={t.category} variant="neutral" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-1.5 p-3 rounded bg-muted/30">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</Label>
                    <Select value={t.state} onValueChange={(v) => setState.mutate({ id: t.id, state: v as TicketState })}>
                      <SelectTrigger className="h-8 text-xs bg-background shadow-sm border-muted-foreground/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Assignee</Label>
                    <Select 
                      value={t.assigned_to ?? "unassigned"} 
                      onValueChange={(v) => { 
                        const employeeId = v === "unassigned" ? null : v;
                        reassign.mutate({ id: t.id, employeeId: employeeId as string });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background shadow-sm border-muted-foreground/20 truncate">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-xs">— Unassigned —</SelectItem>
                        {employees.map((e) => <SelectItem key={e.id} value={e.id} className="text-xs">{e.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t mt-1">
                  <Button size="sm" variant="ghost" className="h-8 px-3" onClick={() => setEditTicket(t)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">No tickets found matching your filters.</div>}
          </div>

          {/* Desktop Table */}
          <Table className="hidden md:table min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">
                    {t.ticket_number}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{t.title}</TableCell>
                  <TableCell>
                    <StatusBadge label={t.category} variant="neutral" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={t.priority}
                      variant={statusToVariant(t.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={t.state}
                      onValueChange={(v) =>
                        setState.mutate({ id: t.id, state: v as TicketState })
                      }
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={t.assigned_to ?? "unassigned"}
                      onValueChange={(v) => {
                        const employeeId = v === "unassigned" ? null : v;
                        reassign.mutate({ id: t.id, employeeId: employeeId as string });
                      }}
                    >
                      <SelectTrigger className="h-8 w-44 text-xs">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-xs">
                          — Unassigned —
                        </SelectItem>
                        {employees.map((e) => (
                          <SelectItem
                            key={e.id}
                            value={e.id}
                            className="text-xs"
                          >
                            {e.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditTicket(t)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Full Ticket Modal */}
      <Dialog open={!!editTicket} onOpenChange={(o) => !o && setEditTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-4 sm:px-6 w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Ticket {editTicket?.ticket_number}</DialogTitle>
          </DialogHeader>
          {editTicket && (
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={editTicket.title} onChange={e => setEditTicket({...editTicket, title: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea rows={4} value={editTicket.description || ""} onChange={e => setEditTicket({...editTicket, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select value={editTicket.priority} onValueChange={v => setEditTicket({...editTicket, priority: v as TicketPriority})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Input value={editTicket.category} onChange={e => setEditTicket({...editTicket, category: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Status</Label>
                  <Select value={editTicket.state} onValueChange={v => setEditTicket({...editTicket, state: v as TicketState})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{STATES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned To</Label>
                  <Select value={editTicket.assigned_to || "unassigned"} onValueChange={v => setEditTicket({...editTicket, assigned_to: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Resolution Notes & Comments</Label>
                  <Textarea rows={5} value={editTicket.resolution_notes || ""} onChange={e => setEditTicket({...editTicket, resolution_notes: e.target.value})} placeholder="Add updates or resolution notes here..." />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 sm:mt-4 sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditTicket(null)}>Cancel</Button>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0" onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Ticket Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md w-[95vw] px-4 sm:px-6">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) =>
                    setNewTicket({
                      ...newTicket,
                      priority: v as TicketPriority,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={newTicket.category}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, category: e.target.value })
                  }
                  placeholder="e.g. Development"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign To (Optional)</Label>
              <Select
                value={newTicket.assigned_to}
                onValueChange={(v) =>
                  setNewTicket({ ...newTicket, assigned_to: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Unassigned —</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 sm:mt-4 sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0" onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}