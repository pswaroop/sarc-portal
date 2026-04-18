// import { useMemo, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { useAuth } from "@/contexts/AuthContext";
// import { 
//   useEmployees, 
//   useTickets, 
//   useCreateTicket, 
//   useUpdateTicketFull 
// } from "@/hooks/useStaffArcData";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import type { Ticket, TicketState, TicketPriority } from "@/types";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "@/hooks/use-toast";
// import { Plus, Search } from "lucide-react";

// const COLUMNS: TicketState[] = ["New", "In Progress", "On Hold", "Resolved", "Closed"];
// const PRIORITIES: TicketPriority[] = ["Low", "Moderate", "High", "Critical"];

// const emptyNewTicket = {
//   title: "",
//   description: "",
//   priority: "Moderate" as TicketPriority,
//   category: "Development",
//   assigned_to: "unassigned",
//   state: "New" as TicketState,
//   resolution_notes: "",
// };

// export default function EmployeeTickets() {
//   const { user } = useAuth();
//   const { data: tickets = [] } = useTickets();
//   const { data: employees = [] } = useEmployees();

//   const createTicket = useCreateTicket();
//   const updateTicketFull = useUpdateTicketFull();

//   // Toolbar state
//   const [searchQuery, setSearchQuery] = useState("");
//   const [priorityFilter, setPriorityFilter] = useState<string>("all");

//   const [createOpen, setCreateOpen] = useState(false);
//   const [newTicket, setNewTicket] = useState({ ...emptyNewTicket });

//   // Ticket Edit Modal State
//   const [editTicket, setEditTicket] = useState<Ticket | null>(null);

//   // Get and filter tickets assigned to OR created by the current employee
//   const filteredTickets = useMemo(() => {
//     return tickets.filter((t) => {
//       // 1. Must belong to current user
//       const isMine = t.assigned_to === user?.id || t.created_by === user?.id;
//       if (!isMine) return false;

//       // 2. Apply Search
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase();
//         const matchesSearch =
//           t.title.toLowerCase().includes(query) ||
//           t.ticket_number?.toLowerCase().includes(query) ||
//           t.category?.toLowerCase().includes(query);
//         if (!matchesSearch) return false;
//       }

//       // 3. Apply Priority Filter
//       if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

//       return true;
//     });
//   }, [tickets, user, searchQuery, priorityFilter]);

//   const grouped = useMemo(() => {
//     const map: Record<TicketState, Ticket[]> = { New: [], "In Progress": [], "On Hold": [], Resolved: [], Closed: [] };
//     filteredTickets.forEach((t) => { if (map[t.state]) map[t.state].push(t); });
//     return map;
//   }, [filteredTickets]);

//   const handleCreate = async () => {
//     if (!newTicket.title) {
//       toast({ title: "Title required", variant: "destructive" });
//       return;
//     }
    
//     try {
//       await createTicket.mutateAsync({
//         ...newTicket,
//         assigned_to: newTicket.assigned_to === "unassigned" || !newTicket.assigned_to ? null : newTicket.assigned_to,
//         created_by: user!.id
//       });
//       toast({ title: "Ticket created successfully" });
//       setCreateOpen(false);
//       setNewTicket({ ...emptyNewTicket }); // Reset form
//     } catch (e: any) {
//       toast({ title: "Failed to create", description: e.message, variant: "destructive" });
//     }
//   };

//   const handleUpdate = async () => {
//     if (!editTicket) return;
//     try {
//       await updateTicketFull.mutateAsync({
//         id: editTicket.id,
//         title: editTicket.title,
//         description: editTicket.description,
//         priority: editTicket.priority,
//         category: editTicket.category,
//         state: editTicket.state,
//         assigned_to: editTicket.assigned_to === "unassigned" || !editTicket.assigned_to ? null : editTicket.assigned_to,
//         resolution_notes: editTicket.resolution_notes
//       });
//       toast({ title: "Ticket updated successfully" });
//       setEditTicket(null);
//     } catch (e: any) {
//       toast({ title: "Update failed", description: e.message, variant: "destructive" });
//     }
//   };

//   return (
//     <div className="space-y-6 overflow-hidden flex flex-col h-[calc(100vh-100px)]">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
//         <div>
//           <h1 className="text-xl font-semibold sm:text-2xl">Ticket Board</h1>
//           <p className="text-sm text-muted-foreground">Manage your assigned and reported tickets.</p>
//         </div>
//         <Button onClick={() => setCreateOpen(true)} className="gap-2">
//           <Plus className="h-4 w-4" /> New Ticket
//         </Button>
//       </div>

//       {/* --- FILTER TOOLBAR --- */}
//       <div className="flex flex-col sm:flex-row gap-3 shrink-0">
//         <div className="relative max-w-sm w-full">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input 
//             placeholder="Search by title, ID, or category..." 
//             className="pl-9" 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="All Priorities" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Priorities</SelectItem>
//             {PRIORITIES.map((p) => (
//               <SelectItem key={p} value={p}>{p}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* --- KANBAN BOARD --- */}
//       <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x flex-1 items-start">
//         {COLUMNS.map((col) => (
//           <div key={col} className="flex-shrink-0 w-[280px] snap-center flex flex-col max-h-full">
//             <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3 shrink-0 flex justify-between items-center pr-2">
//               <span>{col}</span>
//               <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{grouped[col].length}</span>
//             </h2>
//             <div className="space-y-3 bg-muted/30 p-2 rounded-xl overflow-y-auto flex-1 min-h-[150px]">
//               {grouped[col].map((t) => (
//                 <Card 
//                   key={t.id} 
//                   className="cursor-pointer hover:border-primary shadow-sm hover:shadow-md transition-all" 
//                   onClick={() => setEditTicket(t)}
//                 >
//                   <CardContent className="p-3">
//                     <div className="flex justify-between mb-1.5">
//                       <div className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 rounded flex items-center">
//                         {t.ticket_number}
//                       </div>
//                       <StatusBadge label={t.priority} variant={statusToVariant(t.priority)} />
//                     </div>
//                     <div className="text-sm font-medium leading-snug">{t.title}</div>
//                     <div className="mt-3">
//                       <StatusBadge label={t.category} variant="neutral" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//               {grouped[col].length === 0 && (
//                 <div className="text-xs text-center text-muted-foreground/60 py-6 italic border-2 border-dashed border-muted-foreground/20 rounded-lg">
//                   No tickets here
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* --- TICKET EDIT/VIEW MODAL --- */}
//       <Dialog open={!!editTicket} onOpenChange={(o) => !o && setEditTicket(null)}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {editTicket?.ticket_number ? `${editTicket.ticket_number}: ` : ""}
//               Edit Ticket
//             </DialogTitle>
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
//                     <SelectContent>{COLUMNS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setEditTicket(null)}>Cancel</Button>
//             <Button onClick={handleUpdate}>Save Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* --- CREATE TICKET MODAL --- */}
//       <Dialog open={createOpen} onOpenChange={setCreateOpen}>
//         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader><DialogTitle>Create New Ticket</DialogTitle></DialogHeader>
//           <div className="space-y-4 pt-2">
//             <div className="space-y-1.5">
//               <Label>Title *</Label>
//               <Input placeholder="Enter brief title" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
//             </div>
//             <div className="space-y-1.5">
//               <Label>Description</Label>
//               <Textarea rows={3} placeholder="Detailed issue or request..." value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="space-y-1.5">
//                 <Label>Priority</Label>
//                 <Select value={newTicket.priority} onValueChange={v => setNewTicket({...newTicket, priority: v as TicketPriority})}>
//                   <SelectTrigger><SelectValue/></SelectTrigger>
//                   <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Category</Label>
//                 <Input placeholder="e.g. Bug Report" value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} />
//               </div>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Assign To (Optional)</Label>
//               <Select value={newTicket.assigned_to} onValueChange={v => setNewTicket({...newTicket, assigned_to: v})}>
//                 <SelectTrigger><SelectValue placeholder="Assign To"/></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
//                   {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
//             <Button onClick={handleCreate}>Create Ticket</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useEmployees, 
  useTickets, 
  useCreateTicket, 
  useUpdateTicketFull 
} from "@/hooks/useStaffArcData";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import type { Ticket, TicketState, TicketPriority } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, User } from "lucide-react";

const COLUMNS: TicketState[] = ["New", "In Progress", "On Hold", "Resolved", "Closed"];
const PRIORITIES: TicketPriority[] = ["Low", "Moderate", "High", "Critical"];

const emptyNewTicket = {
  title: "",
  description: "",
  priority: "Moderate" as TicketPriority,
  category: "Development",
  assigned_to: "unassigned",
  state: "New" as TicketState,
  resolution_notes: "",
};

export default function EmployeeTickets() {
  const { user } = useAuth();
  const { data: tickets = [] } = useTickets();
  const { data: employees = [] } = useEmployees();

  const createTicket = useCreateTicket();
  const updateTicketFull = useUpdateTicketFull();

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ ...emptyNewTicket });

  // Ticket Edit Modal State
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);

  // Helper to get employee name from ID
  const getEmployeeName = (id?: string) => {
    if (!id) return "Unknown";
    return employees.find((e) => e.id === id)?.full_name || "Unknown";
  };

  // Get and filter tickets assigned to OR created by the current employee
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Must belong to current user
      const isMine = t.assigned_to === user?.id || t.created_by === user?.id;
      if (!isMine) return false;

      // 2. Apply Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          t.title.toLowerCase().includes(query) ||
          t.ticket_number?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 3. Apply Priority Filter
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

      return true;
    });
  }, [tickets, user, searchQuery, priorityFilter]);

  const grouped = useMemo(() => {
    const map: Record<TicketState, Ticket[]> = { New: [], "In Progress": [], "On Hold": [], Resolved: [], Closed: [] };
    filteredTickets.forEach((t) => { if (map[t.state]) map[t.state].push(t); });
    return map;
  }, [filteredTickets]);

  const handleCreate = async () => {
    if (!newTicket.title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    
    try {
      await createTicket.mutateAsync({
        ...newTicket,
        assigned_to: newTicket.assigned_to === "unassigned" || !newTicket.assigned_to ? null : newTicket.assigned_to,
        created_by: user!.id
      });
      toast({ title: "Ticket created successfully" });
      setCreateOpen(false);
      setNewTicket({ ...emptyNewTicket }); // Reset form
    } catch (e: any) {
      toast({ title: "Failed to create", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editTicket) return;
    try {
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
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Ticket Board</h1>
          <p className="text-sm text-muted-foreground">Manage your assigned and reported tickets.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, ID, or category..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- VERTICAL TICKET CATEGORIES --- */}
      <div className="flex flex-col gap-8 overflow-y-auto pb-8 pt-1 flex-1 pr-2">
        {COLUMNS.map((col) => {
          const columnTickets = grouped[col];
          return (
            <div key={col} className="flex flex-col">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                <span>{col}</span>
                <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
                  {columnTickets.length}
                </span>
              </h2>
              
              {columnTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {columnTickets.map((t) => (
                    <Card 
                      key={t.id} 
                      className="cursor-pointer hover:border-primary shadow-sm hover:shadow-md transition-all h-full" 
                      onClick={() => setEditTicket(t)}
                    >
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-mono text-[11px] text-muted-foreground bg-muted px-1.5 rounded flex items-center">
                            {t.ticket_number}
                          </div>
                          <StatusBadge label={t.priority} variant={statusToVariant(t.priority)} />
                        </div>
                        <div className="text-sm font-medium leading-snug flex-1">
                          {t.title}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <StatusBadge label={t.category} variant="neutral" />
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1 border-t">
                            <User className="h-3 w-3" />
                            Reported by: <span className="font-medium text-foreground">{getEmployeeName(t.created_by)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-center text-muted-foreground/60 py-6 italic border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10">
                  No tickets in {col}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- TICKET EDIT/VIEW MODAL --- */}
      <Dialog open={!!editTicket} onOpenChange={(o) => !o && setEditTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTicket?.ticket_number ? `${editTicket.ticket_number}: ` : ""}
              Edit Ticket
            </DialogTitle>
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
                    <SelectContent>{COLUMNS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                    <Label>Reported By</Label>
                    <Input value={getEmployeeName(editTicket.created_by)} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Resolution Notes & Comments</Label>
                  <Textarea rows={4} value={editTicket.resolution_notes || ""} onChange={e => setEditTicket({...editTicket, resolution_notes: e.target.value})} placeholder="Add updates or resolution notes here..." />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditTicket(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- CREATE TICKET MODAL --- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Ticket</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Enter brief title" value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Detailed issue or request..." value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={newTicket.priority} onValueChange={v => setNewTicket({...newTicket, priority: v as TicketPriority})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input placeholder="e.g. Bug Report" value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Assign To (Optional)</Label>
              <Select value={newTicket.assigned_to} onValueChange={v => setNewTicket({...newTicket, assigned_to: v})}>
                <SelectTrigger><SelectValue placeholder="Assign To"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Leave Unassigned —</SelectItem>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}