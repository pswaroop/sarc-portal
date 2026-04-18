// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Pencil, UserPlus, Plus, Trash2, Users, Search } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import { format } from "date-fns";
// import {
//   useAssignments,
//   useCreateAssignment,
//   useUpdateAssignment, // <-- Added for editing assignments
//   useEmployees,
//   useFinancials,
//   useProjects,
//   useUpdateFinancial,
//   useCreateProject,
//   useDeleteProject,
//   useUpdateProject,
//   useDeleteAssignment,
// } from "@/hooks/useStaffArcData";
// import type { ProjectFinancial, ProjectAssignment } from "@/types";

// const emptyNewProject = {
//   name: "",
//   status: "Active",
//   deadline: "",
//   sprints: "",
//   project_type: "",
//   other_details: "",
//   client_name: "",
//   currency: "INR",
//   project_worth: 0,
//   advance_amount: 0,
//   balance_amount: 0,
//   is_paid: false,
// };

// export default function AdminProjects() {
//   const { data: projects = [] } = useProjects();
//   const { data: financials = [] } = useFinancials();
//   const { data: employees = [] } = useEmployees();
//   const { data: assignments = [] } = useAssignments();

//   const updateProject = useUpdateProject();
//   const updateFinancial = useUpdateFinancial();
//   const createAssignment = useCreateAssignment();
//   const updateAssignment = useUpdateAssignment();
//   const deleteAssignment = useDeleteAssignment();
//   const createProject = useCreateProject();
//   const deleteProject = useDeleteProject();

//   const finByProject = useMemo(() => {
//     const m = new Map<string, ProjectFinancial>();
//     financials.forEach((f) => m.set(f.project_id, f));
//     return m;
//   }, [financials]);

//   const empName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";
//   const projName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

//   // --- Filtering State ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [assigneeFilter, setAssigneeFilter] = useState("all");

//   // --- Modals State ---
//   // Project Edit Modal
//   const [editOpen, setEditOpen] = useState(false);
//   const [draftProject, setDraftProject] = useState<any>(null);
//   const [draftFin, setDraftFin] = useState<any>(null);

//   // Assignment Create Modal
//   const [assignOpen, setAssignOpen] = useState(false);
//   const [assignProjectId, setAssignProjectId] = useState<string>("");
//   const [assignEmpId, setAssignEmpId] = useState<string>("");
//   const [assignLeadId, setAssignLeadId] = useState<string>("");
//   const [assignAlloc, setAssignAlloc] = useState<number>(50);

//   // Assignment Edit Modal
//   const [editAssignOpen, setEditAssignOpen] = useState(false);
//   const [draftAssignment, setDraftAssignment] = useState<Partial<ProjectAssignment> | null>(null);

//   // Project Create Modal
//   const [createProjectOpen, setCreateProjectOpen] = useState(false);
//   const [newProject, setNewProject] = useState({ ...emptyNewProject });

//   // --- Filtering Logic ---
//   const filteredProjects = useMemo(() => {
//     return projects.filter((p) => {
//       // Status filter
//       if (statusFilter !== "all" && p.status !== statusFilter) return false;

//       // Assignee filter
//       if (assigneeFilter !== "all") {
//         const hasAssignment = assignments.some(
//           (a) => a.project_id === p.id && a.employee_id === assigneeFilter
//         );
//         if (!hasAssignment) return false;
//       }

//       // Search query filter
//       if (searchQuery) {
//         const q = searchQuery.toLowerCase();
//         const fin = finByProject.get(p.id);
//         const matchesName = p.name.toLowerCase().includes(q);
//         const matchesType = p.project_type?.toLowerCase().includes(q);
//         const matchesClient = fin?.client_name?.toLowerCase().includes(q);
        
//         if (!matchesName && !matchesType && !matchesClient) return false;
//       }

//       return true;
//     });
//   }, [projects, assignments, financials, finByProject, statusFilter, assigneeFilter, searchQuery]);

//   const filteredAssignments = useMemo(() => {
//     return assignments.filter((a) => {
//       const p = projects.find((x) => x.id === a.project_id);
//       if (!p) return false;

//       // Status filter
//       if (statusFilter !== "all" && p.status !== statusFilter) return false;

//       // Assignee filter
//       if (assigneeFilter !== "all" && a.employee_id !== assigneeFilter) return false;

//       // Search query filter
//       if (searchQuery) {
//         const q = searchQuery.toLowerCase();
//         const eName = empName(a.employee_id).toLowerCase();
//         const lName = empName(a.reporting_lead_id).toLowerCase();
//         const pName = p.name.toLowerCase();
        
//         if (!eName.includes(q) && !lName.includes(q) && !pName.includes(q)) return false;
//       }

//       return true;
//     });
//   }, [assignments, projects, employees, statusFilter, assigneeFilter, searchQuery]);

//   // --- Handlers: Projects ---
//   const openEdit = (projectId: string) => {
//     const p = projects.find((x) => x.id === projectId);
//     const f = finByProject.get(projectId) || {
//       project_id: projectId, client_name: "", project_worth: 0, advance_amount: 0,
//       balance_amount: 0, is_paid: false, currency: "INR", billing_type: "Fixed Price", payment_status: "Pending",
//     };
//     setDraftProject({ ...p });
//     setDraftFin({ ...f });
//     setEditOpen(true);
//   };

//   const saveEdit = async () => {
//     if (!draftProject || !draftFin) return;
    
//     await updateProject.mutateAsync({
//       id: draftProject.id, name: draftProject.name, status: draftProject.status,
//       deadline: draftProject.deadline || null, sprints: draftProject.sprints || null,
//       project_type: draftProject.project_type || null, other_details: draftProject.other_details || null,
//     });

//     await updateFinancial.mutateAsync({
//       ...draftFin,
//       payment_status: draftFin.is_paid ? "Paid" : (draftFin.advance_amount > 0 ? "Partial" : "Pending"),
//     });

//     toast({ title: "Project updated completely" });
//     setEditOpen(false);
//   };

//   const handleCreateProject = async () => {
//     if (!newProject.name) {
//       toast({ title: "Project name is required", variant: "destructive" });
//       return;
//     }
    
//     const created = await createProject.mutateAsync({
//       name: newProject.name, status: newProject.status, deadline: newProject.deadline || undefined,
//       sprints: newProject.sprints || undefined, project_type: newProject.project_type || undefined,
//       other_details: newProject.other_details || undefined,
//     });

//     if (created && created.id) {
//       await updateFinancial.mutateAsync({
//         project_id: created.id, client_name: newProject.client_name, currency: newProject.currency,
//         project_worth: newProject.project_worth, advance_amount: newProject.advance_amount,
//         balance_amount: newProject.balance_amount, is_paid: newProject.is_paid, billing_type: "Fixed Price",
//         payment_status: newProject.is_paid ? "Paid" : (newProject.advance_amount > 0 ? "Partial" : "Pending"),
//       } as ProjectFinancial);
//     }

//     toast({ title: "Project created successfully" });
//     setCreateProjectOpen(false);
//     setNewProject({ ...emptyNewProject });
//   };

//   const handleDeleteProject = async (id: string, name: string) => {
//     if (confirm(`Are you sure you want to delete ${name}? This removes all assignments and financials.`)) {
//       await deleteProject.mutateAsync(id);
//       toast({ title: "Project deleted" });
//     }
//   };

//   // --- Handlers: Assignments ---
//   const openAssign = (projectId?: string) => {
//     setAssignProjectId(projectId || "");
//     setAssignEmpId("");
//     setAssignLeadId("");
//     setAssignAlloc(50);
//     setAssignOpen(true);
//   };

//   const saveAssign = async () => {
//     if (!assignProjectId || !assignEmpId || !assignLeadId) {
//       toast({ title: "Missing fields", variant: "destructive" });
//       return;
//     }
//     const project = projects.find((p) => p.id === assignProjectId)!;
//     await createAssignment.mutateAsync({
//       project_id: assignProjectId, employee_id: assignEmpId, reporting_lead_id: assignLeadId,
//       allocation_percentage: assignAlloc, start_date: new Date().toISOString().slice(0, 10),
//       end_date: project.deadline, completion_percentage: 0, latest_status: null, features: "", lead_comments: "",
//     });
//     toast({ title: "Employee assigned successfully" });
//     setAssignOpen(false);
//   };

//   const openEditAssignment = (a: ProjectAssignment) => {
//     setDraftAssignment({ ...a });
//     setEditAssignOpen(true);
//   };

//   const saveEditAssignment = async () => {
//     if (!draftAssignment || !draftAssignment.id) return;
//     try {
//       await updateAssignment.mutateAsync({
//         id: draftAssignment.id,
//         project_id: draftAssignment.project_id,
//         employee_id: draftAssignment.employee_id,
//         reporting_lead_id: draftAssignment.reporting_lead_id,
//         allocation_percentage: draftAssignment.allocation_percentage,
//       });
//       toast({ title: "Allocation updated successfully" });
//       setEditAssignOpen(false);
//       setDraftAssignment(null);
//     } catch (e: any) {
//       toast({ title: "Failed to update allocation", description: e.message, variant: "destructive" });
//     }
//   };

//   const handleDeleteAssignment = async (id: string) => {
//     if (confirm("Are you sure you want to remove this employee from the project?")) {
//       await deleteAssignment.mutateAsync(id);
//       toast({ title: "Assignment removed" });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-xl font-semibold sm:text-2xl">Projects & Assignments</h1>
//           <p className="text-sm text-muted-foreground">Manage projects, financials, and team allocations.</p>
//         </div>
//         <Button onClick={() => setCreateProjectOpen(true)} className="gap-2">
//           <Plus className="h-4 w-4" /> New Project
//         </Button>
//       </div>

//       {/* --- GLOBAL FILTERS --- */}
//       <div className="flex flex-col md:flex-row gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input 
//             placeholder="Search projects, clients, or employees..." 
//             className="pl-9 bg-background" 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-[160px] bg-background">
//             <SelectValue placeholder="All Statuses" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="Active">Active</SelectItem>
//             <SelectItem value="Backlog">Backlog</SelectItem>
//             <SelectItem value="Completed">Completed</SelectItem>
//           </SelectContent>
//         </Select>
//         <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
//           <SelectTrigger className="w-[180px] bg-background">
//             <SelectValue placeholder="Filter by Assignee" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Assignees</SelectItem>
//             {employees.map(e => (
//               <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <Tabs defaultValue="registry" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="registry">Registry</TabsTrigger>
//           <TabsTrigger value="assignments">Assignments</TabsTrigger>
//         </TabsList>

//         {/* --- REGISTRY TAB --- */}
//         <TabsContent value="registry" className="m-0">
//           <Card>
//             <CardHeader className="pb-2 flex flex-row items-center justify-between">
//               <h2 className="text-base font-semibold">
//                 Projects List <span className="text-muted-foreground font-normal text-sm ml-2">({filteredProjects.length})</span>
//               </h2>
//             </CardHeader>
//             <CardContent className="overflow-x-auto p-0">
//               <Table className="hidden md:table">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Project</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Created</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Worth</TableHead>
//                     <TableHead>Paid?</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredProjects.map((p) => {
//                     const fin = finByProject.get(p.id);
//                     return (
//                       <TableRow key={p.id}>
//                         <TableCell className="font-medium">{p.name}</TableCell>
//                         <TableCell className="text-sm">{p.project_type || "—"}</TableCell>
//                         <TableCell className="text-sm text-muted-foreground">
//                           {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
//                         </TableCell>
//                         <TableCell><StatusBadge label={p.status} variant={statusToVariant(p.status)} /></TableCell>
//                         <TableCell>{fin ? `${fin.currency} ${Number(fin.project_worth).toLocaleString()}` : "—"}</TableCell>
//                         <TableCell>
//                           {fin?.is_paid ? <StatusBadge label="Paid" variant="success" /> : <StatusBadge label="Pending" variant="warning" />}
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-1">
//                             <Button size="icon" variant="ghost" onClick={() => openEdit(p.id)}>
//                               <Pencil className="h-3.5 w-3.5" />
//                             </Button>
//                             <Button size="icon" variant="ghost" onClick={() => openAssign(p.id)}>
//                               <UserPlus className="h-3.5 w-3.5" />
//                             </Button>
//                             <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProject(p.id, p.name)}>
//                               <Trash2 className="h-3.5 w-3.5" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                   {filteredProjects.length === 0 && (
//                     <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No projects match your filters.</TableCell></TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* --- ASSIGNMENTS TAB --- */}
//         <TabsContent value="assignments" className="m-0">
//           <Card>
//             <CardHeader className="pb-2 flex flex-row items-center justify-between">
//               <h2 className="text-base font-semibold">
//                 Team Allocations <span className="text-muted-foreground font-normal text-sm ml-2">({filteredAssignments.length})</span>
//               </h2>
//               <Button onClick={() => openAssign()} size="sm" className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
//                 <Users className="h-4 w-4" /> Assign Employee
//               </Button>
//             </CardHeader>
//             <CardContent className="overflow-x-auto p-0">
//               <Table className="hidden md:table">
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Employee</TableHead>
//                     <TableHead>Project</TableHead>
//                     <TableHead>Lead / Manager</TableHead>
//                     <TableHead>Allocation</TableHead>
//                     <TableHead>Progress</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredAssignments.map((a) => (
//                     <TableRow key={a.id}>
//                       <TableCell className="font-medium">{empName(a.employee_id)}</TableCell>
//                       <TableCell>{projName(a.project_id)}</TableCell>
//                       <TableCell className="text-sm text-muted-foreground">{empName(a.reporting_lead_id)}</TableCell>
//                       <TableCell>{a.allocation_percentage}%</TableCell>
//                       <TableCell><StatusBadge label={`${a.completion_percentage}%`} variant="primary" /></TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-1">
//                           <Button size="icon" variant="ghost" onClick={() => openEditAssignment(a)}>
//                             <Pencil className="h-3.5 w-3.5" />
//                           </Button>
//                           <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAssignment(a.id)}>
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {filteredAssignments.length === 0 && (
//                     <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No assignments match your filters.</TableCell></TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* --- CREATE PROJECT MODAL --- */}
//       <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
//           <div className="grid md:grid-cols-2 gap-6 pt-2">
//             <div className="space-y-4">
//               <h3 className="font-semibold text-sm border-b pb-1">Project Details</h3>
//               <div className="space-y-1.5">
//                 <Label>Project Name *</Label>
//                 <Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Status</Label>
//                   <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v })}>
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Active">Active</SelectItem>
//                       <SelectItem value="Backlog">Backlog</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Project Type</Label>
//                   <Input value={newProject.project_type} onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })} placeholder="e.g. Fullstack, Frontend" />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Deadline</Label>
//                   <Input type="date" value={newProject.deadline} onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Sprints</Label>
//                   <Input value={newProject.sprints} onChange={(e) => setNewProject({ ...newProject, sprints: e.target.value })} placeholder="e.g. 4" />
//                 </div>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Other Details / Requirements</Label>
//                 <Textarea rows={3} value={newProject.other_details} onChange={(e) => setNewProject({ ...newProject, other_details: e.target.value })} placeholder="Key requirements, stack, links..." />
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="font-semibold text-sm border-b pb-1">Financials</h3>
//               <div className="space-y-1.5">
//                 <Label>Client Name</Label>
//                 <Input value={newProject.client_name} onChange={(e) => setNewProject({ ...newProject, client_name: e.target.value })} placeholder="Client or Company" />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Total Worth</Label>
//                   <Input type="number" min="0" value={newProject.project_worth} onChange={(e) => setNewProject({ ...newProject, project_worth: Number(e.target.value) })} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Currency</Label>
//                   <Input value={newProject.currency} onChange={(e) => setNewProject({ ...newProject, currency: e.target.value })} />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Advance</Label>
//                   <Input type="number" min="0" value={newProject.advance_amount} onChange={(e) => setNewProject({ ...newProject, advance_amount: Number(e.target.value) })} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Balance</Label>
//                   <Input type="number" min="0" value={newProject.balance_amount} onChange={(e) => setNewProject({ ...newProject, balance_amount: Number(e.target.value) })} />
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 pt-2">
//                 <Switch checked={newProject.is_paid} onCheckedChange={(c) => setNewProject({ ...newProject, is_paid: c })} />
//                 <Label>Payment Fully Cleared?</Label>
//               </div>
//             </div>
//           </div>
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
//             <Button onClick={handleCreateProject}>Create Project</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* --- EDIT PROJECT & FINANCIALS MODAL --- */}
//       <Dialog open={editOpen} onOpenChange={setEditOpen}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader><DialogTitle>Edit Project & Financials</DialogTitle></DialogHeader>
//           {draftProject && draftFin && (
//             <div className="grid md:grid-cols-2 gap-6 pt-2">
//               <div className="space-y-4">
//                 <h3 className="font-semibold text-sm border-b pb-1">Project Details</h3>
//                 <div className="space-y-1.5">
//                   <Label>Name</Label>
//                   <Input value={draftProject.name} onChange={e => setDraftProject({...draftProject, name: e.target.value})} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <Label>Status</Label>
//                     <Select value={draftProject.status} onValueChange={v => setDraftProject({...draftProject, status: v})}>
//                       <SelectTrigger><SelectValue/></SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Active">Active</SelectItem>
//                         <SelectItem value="Backlog">Backlog</SelectItem>
//                         <SelectItem value="Completed">Completed</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label>Project Type</Label>
//                     <Input value={draftProject.project_type || ""} onChange={e => setDraftProject({...draftProject, project_type: e.target.value})} />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <Label>Deadline</Label>
//                     <Input type="date" value={draftProject.deadline || ""} onChange={e => setDraftProject({...draftProject, deadline: e.target.value})} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label>Sprints</Label>
//                     <Input value={draftProject.sprints || ""} onChange={e => setDraftProject({...draftProject, sprints: e.target.value})} />
//                   </div>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Other Details / Requirements</Label>
//                   <Textarea rows={3} value={draftProject.other_details || ""} onChange={e => setDraftProject({...draftProject, other_details: e.target.value})} />
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="font-semibold text-sm border-b pb-1">Financials</h3>
//                 <div className="space-y-1.5">
//                   <Label>Client Name</Label>
//                   <Input value={draftFin.client_name || ""} onChange={e => setDraftFin({...draftFin, client_name: e.target.value})} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <Label>Total Worth</Label>
//                     <Input type="number" min="0" value={draftFin.project_worth} onChange={e => setDraftFin({...draftFin, project_worth: Number(e.target.value)})} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label>Currency</Label>
//                     <Input value={draftFin.currency} onChange={e => setDraftFin({...draftFin, currency: e.target.value})} />
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="space-y-1.5">
//                     <Label>Advance</Label>
//                     <Input type="number" min="0" value={draftFin.advance_amount || 0} onChange={e => setDraftFin({...draftFin, advance_amount: Number(e.target.value)})} />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label>Balance</Label>
//                     <Input type="number" min="0" value={draftFin.balance_amount || 0} onChange={e => setDraftFin({...draftFin, balance_amount: Number(e.target.value)})} />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 pt-2">
//                   <Switch checked={draftFin.is_paid} onCheckedChange={c => setDraftFin({...draftFin, is_paid: c})} />
//                   <Label>Payment Fully Cleared?</Label>
//                 </div>
//               </div>
//             </div>
//           )}
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
//             <Button onClick={saveEdit}>Save All Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* --- ASSIGN EMPLOYEE MODAL --- */}
//       <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader><DialogTitle>Assign Employee to Project</DialogTitle></DialogHeader>
//           <div className="space-y-3 pt-2">
//             <div className="space-y-1.5">
//               <Label>Project</Label>
//               <Select value={assignProjectId} onValueChange={setAssignProjectId}>
//                 <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
//                 <SelectContent>
//                   {projects.filter(p => p.status !== "Completed").map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Employee</Label>
//               <Select value={assignEmpId} onValueChange={setAssignEmpId}>
//                 <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
//                 <SelectContent>
//                   {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Reporting Lead / Manager</Label>
//               <Select value={assignLeadId} onValueChange={setAssignLeadId}>
//                 <SelectTrigger><SelectValue placeholder="Select Lead" /></SelectTrigger>
//                 <SelectContent>
//                   {employees.filter(e => ["Admin", "Manager", "Team Lead"].includes(e.role)).map(e => (
//                     <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.role})</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Allocation %</Label>
//               <Input type="number" min="1" max="100" value={assignAlloc} onChange={(e) => setAssignAlloc(Number(e.target.value))} />
//             </div>
//           </div>
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
//             <Button onClick={saveAssign}>Assign</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* --- EDIT ASSIGNMENT MODAL --- */}
//       <Dialog open={editAssignOpen} onOpenChange={(o) => !o && setEditAssignOpen(false)}>
//         <DialogContent className="max-w-md">
//           <DialogHeader><DialogTitle>Edit Allocation</DialogTitle></DialogHeader>
//           {draftAssignment && (
//             <div className="space-y-3 pt-2">
//               <div className="space-y-1.5">
//                 <Label>Project</Label>
//                 <Select value={draftAssignment.project_id || ""} onValueChange={v => setDraftAssignment({...draftAssignment, project_id: v})}>
//                   <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
//                   <SelectContent>
//                     {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Employee</Label>
//                 <Select value={draftAssignment.employee_id || ""} onValueChange={v => setDraftAssignment({...draftAssignment, employee_id: v})}>
//                   <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
//                   <SelectContent>
//                     {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Reporting Lead / Manager</Label>
//                 <Select value={draftAssignment.reporting_lead_id || ""} onValueChange={v => setDraftAssignment({...draftAssignment, reporting_lead_id: v})}>
//                   <SelectTrigger><SelectValue placeholder="Select Lead" /></SelectTrigger>
//                   <SelectContent>
//                     {employees.filter(e => ["Admin", "Manager", "Team Lead"].includes(e.role)).map(e => (
//                       <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.role})</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Allocation %</Label>
//                 <Input type="number" min="1" max="100" value={draftAssignment.allocation_percentage || 50} onChange={(e) => setDraftAssignment({...draftAssignment, allocation_percentage: Number(e.target.value)})} />
//               </div>
//             </div>
//           )}
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setEditAssignOpen(false)}>Cancel</Button>
//             <Button onClick={saveEditAssignment}>Save Updates</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, UserPlus, Plus, Trash2, Users, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  useAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useEmployees,
  useFinancials,
  useProjects,
  useUpdateFinancial,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
  useDeleteAssignment,
} from "@/hooks/useStaffArcData";
import type { ProjectFinancial, ProjectAssignment } from "@/types";

const emptyNewProject = {
  name: "",
  status: "Active",
  deadline: "",
  sprints: "",
  project_type: "",
  other_details: "",
  client_name: "",
  currency: "INR",
  project_worth: 0,
  advance_amount: 0,
  balance_amount: 0,
  is_paid: false,
};

export default function AdminProjects() {
  const { data: projects = [] } = useProjects();
  const { data: financials = [] } = useFinancials();
  const { data: employees = [] } = useEmployees();
  const { data: assignments = [] } = useAssignments();

  const updateProject = useUpdateProject();
  const updateFinancial = useUpdateFinancial();
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();

  const finByProject = useMemo(() => {
    const m = new Map<string, ProjectFinancial>();
    financials.forEach((f) => m.set(f.project_id, f));
    return m;
  }, [financials]);

  const empName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";
  const projName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  // --- Filtering State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // --- Modals State ---
  // Project Edit Modal
  const [editOpen, setEditOpen] = useState(false);
  const [draftProject, setDraftProject] = useState<any>(null);
  const [draftFin, setDraftFin] = useState<any>(null);

  // Assignment Create Modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState<string>("");
  const [assignEmpId, setAssignEmpId] = useState<string>("");
  const [assignLeadId, setAssignLeadId] = useState<string>("");
  const [assignAlloc, setAssignAlloc] = useState<number>(50);

  // Assignment Edit Modal
  const [editAssignOpen, setEditAssignOpen] = useState(false);
  const [draftAssignment, setDraftAssignment] = useState<Partial<ProjectAssignment> | null>(null);

  // Project Create Modal
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ ...emptyNewProject });

  // --- Filtering Logic ---
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) return false;

      // Assignee filter
      if (assigneeFilter !== "all") {
        const hasAssignment = assignments.some(
          (a) => a.project_id === p.id && a.employee_id === assigneeFilter
        );
        if (!hasAssignment) return false;
      }

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fin = finByProject.get(p.id);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesType = p.project_type?.toLowerCase().includes(q);
        const matchesClient = fin?.client_name?.toLowerCase().includes(q);
        
        if (!matchesName && !matchesType && !matchesClient) return false;
      }

      return true;
    });
  }, [projects, assignments, financials, finByProject, statusFilter, assigneeFilter, searchQuery]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const p = projects.find((x) => x.id === a.project_id);
      if (!p) return false;

      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) return false;

      // Assignee filter
      if (assigneeFilter !== "all" && a.employee_id !== assigneeFilter) return false;

      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const eName = empName(a.employee_id).toLowerCase();
        const lName = empName(a.reporting_lead_id).toLowerCase();
        const pName = p.name.toLowerCase();
        
        if (!eName.includes(q) && !lName.includes(q) && !pName.includes(q)) return false;
      }

      return true;
    });
  }, [assignments, projects, employees, statusFilter, assigneeFilter, searchQuery]);

  // --- Handlers: Projects ---
  const openEdit = (projectId: string) => {
    const p = projects.find((x) => x.id === projectId);
    const f = finByProject.get(projectId) || {
      project_id: projectId, client_name: "", project_worth: 0, advance_amount: 0,
      balance_amount: 0, is_paid: false, currency: "INR", billing_type: "Fixed Price", payment_status: "Pending",
    };
    setDraftProject({ ...p });
    setDraftFin({ ...f });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!draftProject || !draftFin) return;
    
    await updateProject.mutateAsync({
      id: draftProject.id, name: draftProject.name, status: draftProject.status,
      deadline: draftProject.deadline || null, sprints: draftProject.sprints || null,
      project_type: draftProject.project_type || null, other_details: draftProject.other_details || null,
    });

    await updateFinancial.mutateAsync({
      ...draftFin,
      payment_status: draftFin.is_paid ? "Paid" : (draftFin.advance_amount > 0 ? "Partial" : "Pending"),
    });

    toast({ title: "Project updated completely" });
    setEditOpen(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name) {
      toast({ title: "Project name is required", variant: "destructive" });
      return;
    }
    
    const created = await createProject.mutateAsync({
      name: newProject.name, status: newProject.status, deadline: newProject.deadline || undefined,
      sprints: newProject.sprints || undefined, project_type: newProject.project_type || undefined,
      other_details: newProject.other_details || undefined,
    });

    if (created && created.id) {
      await updateFinancial.mutateAsync({
        project_id: created.id, client_name: newProject.client_name, currency: newProject.currency,
        project_worth: newProject.project_worth, advance_amount: newProject.advance_amount,
        balance_amount: newProject.balance_amount, is_paid: newProject.is_paid, billing_type: "Fixed Price",
        payment_status: newProject.is_paid ? "Paid" : (newProject.advance_amount > 0 ? "Partial" : "Pending"),
      } as ProjectFinancial);
    }

    toast({ title: "Project created successfully" });
    setCreateProjectOpen(false);
    setNewProject({ ...emptyNewProject });
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This removes all assignments and financials.`)) {
      await deleteProject.mutateAsync(id);
      toast({ title: "Project deleted" });
    }
  };

  // --- Handlers: Assignments ---
  const openAssign = (projectId?: string) => {
    setAssignProjectId(projectId || "");
    setAssignEmpId("");
    setAssignLeadId("");
    setAssignAlloc(50);
    setAssignOpen(true);
  };

  const saveAssign = async () => {
    if (!assignProjectId || !assignEmpId || !assignLeadId) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const project = projects.find((p) => p.id === assignProjectId)!;
    await createAssignment.mutateAsync({
      project_id: assignProjectId, employee_id: assignEmpId, reporting_lead_id: assignLeadId,
      allocation_percentage: assignAlloc, start_date: new Date().toISOString().slice(0, 10),
      end_date: project.deadline, completion_percentage: 0, latest_status: null, features: "", lead_comments: "",
    });
    toast({ title: "Employee assigned successfully" });
    setAssignOpen(false);
  };

  const openEditAssignment = (a: ProjectAssignment) => {
    setDraftAssignment({ ...a });
    setEditAssignOpen(true);
  };

  const saveEditAssignment = async () => {
    if (!draftAssignment || !draftAssignment.id) return;
    try {
      await updateAssignment.mutateAsync({
        id: draftAssignment.id,
        project_id: draftAssignment.project_id,
        employee_id: draftAssignment.employee_id,
        reporting_lead_id: draftAssignment.reporting_lead_id,
        allocation_percentage: draftAssignment.allocation_percentage,
      });
      toast({ title: "Allocation updated successfully" });
      setEditAssignOpen(false);
      setDraftAssignment(null);
    } catch (e: any) {
      toast({ title: "Failed to update allocation", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm("Are you sure you want to remove this employee from the project?")) {
      await deleteAssignment.mutateAsync(id);
      toast({ title: "Assignment removed" });
    }
  };

  return (
    <div className="space-y-6 max-w-full px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Projects & Assignments</h1>
          <p className="text-sm text-muted-foreground">Manage projects, financials, and team allocations.</p>
        </div>
        <Button onClick={() => setCreateProjectOpen(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* --- GLOBAL FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects, clients, or employees..." 
            className="pl-9 bg-background w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[160px] bg-background">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Backlog">Backlog</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-background">
            <SelectValue placeholder="Filter by Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {employees.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="registry" className="space-y-6 w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger value="registry">Registry</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        {/* --- REGISTRY TAB --- */}
        <TabsContent value="registry" className="m-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <h2 className="text-base font-semibold">
                Projects List <span className="text-muted-foreground font-normal text-sm ml-2">({filteredProjects.length})</span>
              </h2>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 sm:p-4">
              
              {/* Mobile View */}
              <div className="grid gap-4 md:hidden p-4">
                {filteredProjects.map(p => {
                  const fin = finByProject.get(p.id);
                  return (
                    <div key={p.id} className="flex flex-col gap-3 rounded-lg border p-4 bg-card/50 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-base truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground truncate mt-0.5">{p.project_type || "—"}</div>
                        </div>
                        <StatusBadge label={p.status} variant={statusToVariant(p.status)} />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm bg-muted/30 p-2.5 rounded">
                        <div className="text-muted-foreground font-medium">
                          {fin ? `${fin.currency} ${Number(fin.project_worth).toLocaleString()}` : "—"}
                        </div>
                        <div>
                          {fin?.is_paid ? <StatusBadge label="Paid" variant="success" /> : <StatusBadge label="Pending" variant="warning" />}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t mt-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => openEdit(p.id)}>
                          <Pencil className="h-3.5 w-3.5 mr-1.5"/> Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => openAssign(p.id)}>
                          <UserPlus className="h-3.5 w-3.5 mr-1.5"/> Assign
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProject(p.id, p.name)}>
                          <Trash2 className="h-3.5 w-3.5"/>
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {filteredProjects.length === 0 && <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">No projects match your filters.</div>}
              </div>

              {/* Desktop Table */}
              <Table className="hidden md:table min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Worth</TableHead>
                    <TableHead>Paid?</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((p) => {
                    const fin = finByProject.get(p.id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-sm">{p.project_type || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell><StatusBadge label={p.status} variant={statusToVariant(p.status)} /></TableCell>
                        <TableCell>{fin ? `${fin.currency} ${Number(fin.project_worth).toLocaleString()}` : "—"}</TableCell>
                        <TableCell>
                          {fin?.is_paid ? <StatusBadge label="Paid" variant="success" /> : <StatusBadge label="Pending" variant="warning" />}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(p.id)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => openAssign(p.id)}>
                              <UserPlus className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProject(p.id, p.name)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredProjects.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No projects match your filters.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ASSIGNMENTS TAB --- */}
        <TabsContent value="assignments" className="m-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-semibold">
                Team Allocations <span className="text-muted-foreground font-normal text-sm ml-2">({filteredAssignments.length})</span>
              </h2>
              <Button onClick={() => openAssign()} size="sm" className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full sm:w-auto">
                <Users className="h-4 w-4" /> Assign Employee
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 sm:p-4">
              
              {/* Mobile View */}
              <div className="grid gap-4 md:hidden p-4">
                {filteredAssignments.map(a => (
                  <div key={a.id} className="flex flex-col gap-3 rounded-lg border p-4 bg-card/50 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-base truncate">{empName(a.employee_id)}</div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">{projName(a.project_id)}</div>
                      </div>
                      <StatusBadge label={`${a.completion_percentage}%`} variant="primary" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded mt-1">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Lead/Manager</span>
                        <span className="font-medium">{empName(a.reporting_lead_id)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground block mb-0.5">Allocation</span>
                        <span className="font-medium">{a.allocation_percentage}%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t mt-1">
                      <Button size="sm" variant="ghost" className="h-8 px-3" onClick={() => openEditAssignment(a)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5"/> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAssignment(a.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5"/> Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredAssignments.length === 0 && <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">No assignments match your filters.</div>}
              </div>

              {/* Desktop Table */}
              <Table className="hidden md:table min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Lead / Manager</TableHead>
                    <TableHead>Allocation</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{empName(a.employee_id)}</TableCell>
                      <TableCell>{projName(a.project_id)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{empName(a.reporting_lead_id)}</TableCell>
                      <TableCell>{a.allocation_percentage}%</TableCell>
                      <TableCell><StatusBadge label={`${a.completion_percentage}%`} variant="primary" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditAssignment(a)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAssignment(a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No assignments match your filters.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- CREATE PROJECT MODAL --- */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto px-4 sm:px-6">
          <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-1">Project Details</h3>
              <div className="space-y-1.5">
                <Label>Project Name *</Label>
                <Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Project Type</Label>
                  <Input value={newProject.project_type} onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })} placeholder="e.g. Fullstack" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Deadline</Label>
                  <Input type="date" value={newProject.deadline} onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Sprints</Label>
                  <Input value={newProject.sprints} onChange={(e) => setNewProject({ ...newProject, sprints: e.target.value })} placeholder="e.g. 4" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Other Details / Requirements</Label>
                <Textarea rows={3} value={newProject.other_details} onChange={(e) => setNewProject({ ...newProject, other_details: e.target.value })} placeholder="Key requirements, stack, links..." />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-1">Financials</h3>
              <div className="space-y-1.5">
                <Label>Client Name</Label>
                <Input value={newProject.client_name} onChange={(e) => setNewProject({ ...newProject, client_name: e.target.value })} placeholder="Client or Company" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Total Worth</Label>
                  <Input type="number" min="0" value={newProject.project_worth} onChange={(e) => setNewProject({ ...newProject, project_worth: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input value={newProject.currency} onChange={(e) => setNewProject({ ...newProject, currency: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Advance</Label>
                  <Input type="number" min="0" value={newProject.advance_amount} onChange={(e) => setNewProject({ ...newProject, advance_amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Balance</Label>
                  <Input type="number" min="0" value={newProject.balance_amount} onChange={(e) => setNewProject({ ...newProject, balance_amount: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={newProject.is_paid} onCheckedChange={(c) => setNewProject({ ...newProject, is_paid: c })} />
                <Label>Payment Fully Cleared?</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 sm:mt-4 sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setCreateProjectOpen(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0" onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- EDIT PROJECT & FINANCIALS MODAL --- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto px-4 sm:px-6">
          <DialogHeader><DialogTitle>Edit Project & Financials</DialogTitle></DialogHeader>
          {draftProject && draftFin && (
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-1">Project Details</h3>
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={draftProject.name} onChange={e => setDraftProject({...draftProject, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={draftProject.status} onValueChange={v => setDraftProject({...draftProject, status: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Backlog">Backlog</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Project Type</Label>
                    <Input value={draftProject.project_type || ""} onChange={e => setDraftProject({...draftProject, project_type: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Deadline</Label>
                    <Input type="date" value={draftProject.deadline || ""} onChange={e => setDraftProject({...draftProject, deadline: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sprints</Label>
                    <Input value={draftProject.sprints || ""} onChange={e => setDraftProject({...draftProject, sprints: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Other Details / Requirements</Label>
                  <Textarea rows={3} value={draftProject.other_details || ""} onChange={e => setDraftProject({...draftProject, other_details: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-1">Financials</h3>
                <div className="space-y-1.5">
                  <Label>Client Name</Label>
                  <Input value={draftFin.client_name || ""} onChange={e => setDraftFin({...draftFin, client_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Total Worth</Label>
                    <Input type="number" min="0" value={draftFin.project_worth} onChange={e => setDraftFin({...draftFin, project_worth: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Input value={draftFin.currency} onChange={e => setDraftFin({...draftFin, currency: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Advance</Label>
                    <Input type="number" min="0" value={draftFin.advance_amount || 0} onChange={e => setDraftFin({...draftFin, advance_amount: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Balance</Label>
                    <Input type="number" min="0" value={draftFin.balance_amount || 0} onChange={e => setDraftFin({...draftFin, balance_amount: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={draftFin.is_paid} onCheckedChange={c => setDraftFin({...draftFin, is_paid: c})} />
                  <Label>Payment Fully Cleared?</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 sm:mt-4 sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0" onClick={saveEdit}>Save All Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- ASSIGN EMPLOYEE MODAL --- */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md w-[95vw] px-4 sm:px-6">
          <DialogHeader><DialogTitle>Assign Employee to Project</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={assignProjectId} onValueChange={setAssignProjectId}>
                <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                <SelectContent>
                  {projects.filter(p => p.status !== "Completed").map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={assignEmpId} onValueChange={setAssignEmpId}>
                <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reporting Lead / Manager</Label>
              <Select value={assignLeadId} onValueChange={setAssignLeadId}>
                <SelectTrigger><SelectValue placeholder="Select Lead" /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => ["Admin", "Manager", "Team Lead"].includes(e.role)).map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Allocation %</Label>
              <Input type="number" min="1" max="100" value={assignAlloc} onChange={(e) => setAssignAlloc(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter className="mt-6 sm:mt-4 sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0" onClick={saveAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- EDIT ASSIGNMENT MODAL --- */}
      <Dialog open={editAssignOpen} onOpenChange={(o) => !o && setEditAssignOpen(false)}>
        <DialogContent className="max-w-md w-[95vw] px-4 sm:px-6">
          <DialogHeader><DialogTitle>Edit Allocation</DialogTitle></DialogHeader>
          {draftAssignment && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select value={draftAssignment.project_id || ""} onValueChange={v => setDraftAssignment({...draftAssignment, project_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Employee</Label>
                <Select value={draftAssignment.employee_id || ""} onValueChange={v => setDraftAssignment({...draftAssignment, employee_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reporting Lead / Manager</Label>
                <Select value={draftAssignment.reporting_lead_id || ""} onValueChange={v => setDraftAssignment({...draftAssignment, reporting_lead_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Lead" /></SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => ["Admin", "Manager", "Team Lead"].includes(e.role)).map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Allocation %</Label>
                <Input type="number" min="1" max="100" value={draftAssignment.allocation_percentage || 50} onChange={(e) => setDraftAssignment({...draftAssignment, allocation_percentage: Number(e.target.value)})} />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 sm:mt-4 sm:space-x-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setEditAssignOpen(false)}>Cancel</Button>
            <Button className="w-full sm:w-auto mt-2 sm:mt-0" onClick={saveEditAssignment}>Save Updates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}