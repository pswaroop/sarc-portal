// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { KpiCard } from "@/components/KpiCard";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Users,
//   Briefcase,
//   AlertOctagon,
//   AlertTriangle,
//   UserPlus,
//   Table as TableIcon,
//   Filter,
//   CheckCircle2,
//   Clock,
//   CalendarDays
// } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import {
//   useAssignments,
//   useDailyUpdates,
//   useEmployees,
//   useProjects,
//   useCreateAssignment,
// } from "@/hooks/useStaffArcData";
// import { useAuth } from "@/contexts/AuthContext";
// import { differenceInCalendarDays, format } from "date-fns";

// function elapsedPercent(start: string | null, end: string | null): number {
//   if (!start || !end) return 0;
//   const total = differenceInCalendarDays(new Date(end), new Date(start));
//   const done = differenceInCalendarDays(new Date(), new Date(start));
//   if (total <= 0) return 100;
//   return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
// }

// export default function ManagerDashboard() {
//   const { user } = useAuth();
//   const { data: assignments = [] } = useAssignments();
//   const { data: projects = [] } = useProjects();
//   const { data: employees = [] } = useEmployees();
//   const { data: updates = [] } = useDailyUpdates();

//   const createAssignment = useCreateAssignment();

//   // Assignment Modal State
//   const [assignOpen, setAssignOpen] = useState(false);
//   const [assignProjectId, setAssignProjectId] = useState<string>("");
//   const [assignEmpId, setAssignEmpId] = useState<string>("");
//   const [assignAlloc, setAssignAlloc] = useState<number>(50);

//   // Updates Table Filters
//   const [filterProject, setFilterProject] = useState("all");
//   const [filterEmployee, setFilterEmployee] = useState("all");
//   const [filterBlocker, setFilterBlocker] = useState("all");

//   const scoped = useMemo(() => {
//     if (!user) return assignments;
//     if (user.role === "Team Lead")
//       return assignments.filter((a) => a.reporting_lead_id === user.id);
//     return assignments;
//   }, [assignments, user]);

//   const teamIds = new Set(scoped.map((a) => a.employee_id));
//   const activeProjectIds = new Set(scoped.map((a) => a.project_id));
//   const teamSize = teamIds.size;
//   const activeAssignments = scoped.length;

//   // 1. Filter raw updates to only show team members
//   const teamUpdates = updates.filter(
//     (u) => user?.role !== "Team Lead" || teamIds.has(u.employee_id)
//   );
  
//   const blockers = teamUpdates.filter((u) => u.has_blocker);

//   // 2. Apply explicit user filters for the table
//   const filteredUpdatesTable = teamUpdates.filter((u) => {
//     if (filterProject !== "all" && u.project_id !== filterProject) return false;
//     if (filterEmployee !== "all" && u.employee_id !== filterEmployee) return false;
//     if (filterBlocker === "has_blocker" && !u.has_blocker) return false;
//     if (filterBlocker === "no_blocker" && u.has_blocker) return false;
//     return true;
//   }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   const projectName = (id: string) =>
//     projects.find((p) => p.id === id)?.name ?? "—";
//   const employeeName = (id: string) =>
//     employees.find((e) => e.id === id)?.full_name ?? "—";

//   // Map the tracked assignments to calculate variance and safely fallback the deadline.
//   const tracked = scoped.map((a) => {
//     const project = projects.find(p => p.id === a.project_id);
//     const effectiveDeadline = a.end_date || project?.deadline || (project as any)?.end_date || null;
    
//     const elapsed = elapsedPercent(a.start_date, effectiveDeadline);
//     const variance = a.completion_percentage - elapsed;
    
//     return { ...a, effectiveDeadline, elapsed, variance };
//   });

//   const atRisk = tracked.filter((t) => t.variance <= -20).length;

//   const handleAssign = async () => {
//     if (!assignProjectId || !assignEmpId) {
//       toast({ title: "Missing fields", variant: "destructive" });
//       return;
//     }
//     const project = projects.find((p) => p.id === assignProjectId);

//     try {
//       await createAssignment.mutateAsync({
//         project_id: assignProjectId,
//         employee_id: assignEmpId,
//         reporting_lead_id: user!.id,
//         allocation_percentage: assignAlloc,
//         start_date: new Date().toISOString().slice(0, 10),
//         end_date: project?.deadline || (project as any)?.end_date || null,
//         completion_percentage: 0,
//         latest_status: null,
//         features: "",
//         lead_comments: "",
//       });

//       toast({ title: "Employee assigned successfully" });
//       setAssignOpen(false);
//       setAssignProjectId("");
//       setAssignEmpId("");
//       setAssignAlloc(50);
//     } catch (e: any) {
//       toast({ title: "Assignment failed", description: e.message, variant: "destructive" });
//     }
//   };

//   return (
//     <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
//       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//         <div>
//           <h1 className="text-xl font-semibold sm:text-2xl">Team Overview</h1>
//           <p className="text-sm text-muted-foreground">
//             Track delivery health and surface blockers across your team.
//           </p>
//         </div>
//         <Button onClick={() => setAssignOpen(true)} className="gap-2 w-full sm:w-auto shrink-0">
//           <UserPlus className="h-4 w-4" /> Assign Employee
//         </Button>
//       </div>

//       {/* --- KPI GRID --- */}
//       <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
//         <KpiCard label="Team size" value={teamSize} icon={Users} variant="info" />
//         <KpiCard label="Active" value={activeAssignments} icon={Briefcase} variant="primary" />
//         <KpiCard label="Blockers" value={blockers.length} icon={AlertOctagon} variant="destructive" hint="Needs attention" />
//         <KpiCard label="At risk" value={atRisk} icon={AlertTriangle} variant="warning" hint=">20% behind" />
//       </div>

//       {/* --- MAIN CONTENT --- */}
//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Progress Tracker */}
//         <Card className="lg:col-span-2 shadow-sm">
//           <CardHeader className="pb-3 border-b bg-muted/10">
//             <h2 className="text-base font-semibold">Automated Progress Tracker</h2>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               Compares time elapsed vs actual completion. Flags &gt;20% lag.
//             </p>
//           </CardHeader>
//           <CardContent className="space-y-4 pt-4">
//             {tracked.length === 0 && (
//               <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl mx-1 sm:mx-0">
//                 No active team assignments.
//               </div>
//             )}
//             {tracked.map((t) => {
//               const lagging = t.variance <= -20;
//               return (
//                 <div key={t.id} className="rounded-lg border bg-card/40 p-4 flex flex-col gap-4 hover:bg-muted/20 transition-colors">
//                   <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//                     <div className="min-w-0 flex-1">
//                       <div className="truncate text-sm font-medium leading-snug">
//                         {projectName(t.project_id)}
//                       </div>
//                       <div className="text-xs text-muted-foreground mt-1 truncate">
//                         {employeeName(t.employee_id)}
//                         {t.effectiveDeadline && ` · Due ${format(new Date(t.effectiveDeadline), "MMM d, yyyy")}`}
//                       </div>
//                     </div>
//                     <div className="shrink-0 self-start sm:self-auto">
//                       {lagging ? (
//                         <StatusBadge label={`Lagging ${Math.abs(t.variance)}%`} variant="destructive" />
//                       ) : t.variance >= 0 ? (
//                         <StatusBadge label="On track" variant="success" />
//                       ) : (
//                         <StatusBadge label={`${Math.abs(t.variance)}% behind`} variant="warning" />
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div>
//                       <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
//                         <span>Time elapsed</span>
//                         <span>{t.elapsed}%</span>
//                       </div>
//                       <Progress value={t.elapsed} className="h-1.5 [&>div]:bg-muted-foreground/40 dark:[&>div]:bg-muted-foreground/60" />
//                     </div>
//                     <div>
//                       <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
//                         <span>Actual completion</span>
//                         <span>{t.completion_percentage}%</span>
//                       </div>
//                       <Progress value={t.completion_percentage} className={`h-1.5 ${lagging ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`} />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </CardContent>
//         </Card>

//         {/* Action Center (Blockers) */}
//         <Card className="shadow-sm h-fit">
//           <CardHeader className="pb-3 border-b bg-muted/10">
//             <h2 className="text-base font-semibold flex items-center gap-2">
//               <AlertTriangle className="w-4 h-4 text-destructive" /> Action Center
//             </h2>
//             <p className="text-xs text-muted-foreground mt-0.5">Recent blockers from your team.</p>
//           </CardHeader>
//           <CardContent className="space-y-3 pt-4">
//             {blockers.length === 0 && (
//               <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl mx-1 sm:mx-0">
//                 No active blockers 🎉
//               </div>
//             )}
//             {blockers.map((b) => (
//               <div key={b.id} className="rounded-lg border-l-4 border-destructive bg-destructive/5 p-3.5 flex flex-col gap-1.5">
//                 <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
//                   <span className="font-semibold text-foreground truncate">{employeeName(b.employee_id)}</span>
//                   <span className="text-muted-foreground shrink-0 font-medium bg-background/50 px-1.5 py-0.5 rounded">
//                     {format(new Date(b.date), "MMM d")}
//                   </span>
//                 </div>
//                 <div className="text-xs text-muted-foreground truncate">{projectName(b.project_id)}</div>
//                 <p className="mt-1 text-sm text-foreground break-words whitespace-pre-wrap leading-relaxed">
//                   {b.blocker_description}
//                 </p>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>

//       {/* --- ALL DAILY UPDATES TABULAR FEED --- */}
//       <Card className="shadow-sm">
//         <CardHeader className="pb-3 border-b bg-muted/10">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h2 className="text-base font-semibold flex items-center gap-2">
//                 <TableIcon className="w-4 h-4 text-primary" /> Daily Updates Records
//               </h2>
//               <p className="text-xs text-muted-foreground mt-0.5">Tabular view of all updates submitted by your team.</p>
//             </div>
            
//             {/* Filters */}
//             <div className="flex flex-col sm:flex-row items-center gap-2">
//               <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
//               <Select value={filterProject} onValueChange={setFilterProject}>
//                 <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
//                   <SelectValue placeholder="All Projects" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Projects</SelectItem>
//                   {projects
//                     .filter(p => activeProjectIds.has(p.id) || user?.role !== "Team Lead")
//                     .map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
//                 </SelectContent>
//               </Select>

//               <Select value={filterEmployee} onValueChange={setFilterEmployee}>
//                 <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
//                   <SelectValue placeholder="All Employees" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Employees</SelectItem>
//                   {employees
//                     .filter(e => teamIds.has(e.id) || user?.role !== "Team Lead")
//                     .map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
//                 </SelectContent>
//               </Select>

//               <Select value={filterBlocker} onValueChange={setFilterBlocker}>
//                 <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
//                   <SelectValue placeholder="All Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="has_blocker">With Blockers</SelectItem>
//                   <SelectItem value="no_blocker">No Blockers</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
//               <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
//                 <tr>
//                   <th className="px-4 py-3 font-medium w-[120px]">Date</th>
//                   <th className="px-4 py-3 font-medium w-[160px]">Employee / Project</th>
//                   <th className="px-4 py-3 font-medium w-[22%]">
//                     <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600"/> Completed</div>
//                   </th>
//                   <th className="px-4 py-3 font-medium w-[22%]">
//                     <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> In Progress</div>
//                   </th>
//                   <th className="px-4 py-3 font-medium w-[22%]">
//                     <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-purple-500"/> Planned</div>
//                   </th>
//                   <th className="px-4 py-3 font-medium w-[180px]">
//                     <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500"/> Blocker</div>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {filteredUpdatesTable.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
//                       No updates match the selected filters.
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredUpdatesTable.map((u: any) => (
//                     <tr key={u.id} className={`hover:bg-muted/10 transition-colors ${u.has_blocker ? 'bg-destructive/5' : ''}`}>
//                       <td className="px-4 py-3 align-top whitespace-nowrap">
//                         <span className="font-medium text-foreground">{format(new Date(u.date), "MMM d, yyyy")}</span>
//                         <div className="text-xs text-muted-foreground mt-0.5">{u.hours_worked ? `${u.hours_worked} hours` : ""}</div>
//                       </td>
//                       <td className="px-4 py-3 align-top">
//                         <div className="font-medium text-foreground">{employeeName(u.employee_id)}</div>
//                         <div className="text-xs text-muted-foreground mt-0.5">{projectName(u.project_id)}</div>
//                       </td>
//                       <td className="px-4 py-3 align-top text-[13px] whitespace-pre-wrap text-foreground/90">
//                         {u.completed || u.completed_tasks || "—"}
//                       </td>
//                       <td className="px-4 py-3 align-top text-[13px] whitespace-pre-wrap text-foreground/90">
//                         {u.in_progress || u.in_progress_tasks || "—"}
//                       </td>
//                       <td className="px-4 py-3 align-top text-[13px] whitespace-pre-wrap text-muted-foreground">
//                         {u.planned || u.planned_tasks || "—"}
//                       </td>
//                       <td className="px-4 py-3 align-top">
//                         {u.has_blocker ? (
//                           <div className="text-[13px] text-destructive whitespace-pre-wrap font-medium">
//                             {u.blocker_description || "Blocker active without description"}
//                           </div>
//                         ) : (
//                           <span className="text-xs text-muted-foreground/60 italic">No blockers</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* --- ASSIGN EMPLOYEE MODAL --- */}
//       <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
//         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Assign Employee to Project</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4 pt-2">
//             <div className="space-y-1.5">
//               <Label>Project</Label>
//               <Select value={assignProjectId} onValueChange={setAssignProjectId}>
//                 <SelectTrigger><SelectValue placeholder="Select active project" /></SelectTrigger>
//                 <SelectContent>
//                   {projects.filter((p) => p.status === "Active").map((p) => (
//                     <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Employee</Label>
//               <Select value={assignEmpId} onValueChange={setAssignEmpId}>
//                 <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
//                 <SelectContent>
//                   {employees.map((e) => (
//                     <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.role})</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-1.5">
//               <Label>Allocation (%)</Label>
//               <Input type="number" min={0} max={100} value={assignAlloc} onChange={(e) => setAssignAlloc(Number(e.target.value))} />
//             </div>
//             <p className="text-[11px] leading-relaxed text-muted-foreground pt-1 italic bg-muted/30 p-2 rounded border">
//               Note: As a Manager/Lead, you will automatically be assigned as the Reporting Lead for this assignment.
//             </p>
//           </div>
//           <DialogFooter className="mt-4 sm:space-x-2">
//             <Button variant="outline" onClick={() => setAssignOpen(false)} className="w-full sm:w-auto">Cancel</Button>
//             <Button onClick={handleAssign} className="w-full sm:w-auto mt-2 sm:mt-0">Create Assignment</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Briefcase,
  AlertOctagon,
  AlertTriangle,
  UserPlus,
  Table as TableIcon,
  Filter,
  CheckCircle2,
  Clock,
  CalendarDays,
  UserCheck,
  XCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useAssignments,
  useDailyUpdates,
  useEmployees,
  useProjects,
  useCreateAssignment,
} from "@/hooks/useStaffArcData";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInCalendarDays, format } from "date-fns";

function elapsedPercent(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const total = differenceInCalendarDays(new Date(end), new Date(start));
  const done = differenceInCalendarDays(new Date(), new Date(start));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: projects = [] } = useProjects();
  const { data: employees = [] } = useEmployees();
  const { data: updates = [] } = useDailyUpdates();

  const createAssignment = useCreateAssignment();

  // Assignment Modal State
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState<string>("");
  const [assignEmpId, setAssignEmpId] = useState<string>("");
  const [assignAlloc, setAssignAlloc] = useState<number>(50);

  // Updates Table Filters
  const [filterProject, setFilterProject] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterBlocker, setFilterBlocker] = useState("all");

  const scoped = useMemo(() => {
    if (!user) return assignments;
    if (user.role === "Team Lead")
      return assignments.filter((a) => a.reporting_lead_id === user.id);
    return assignments;
  }, [assignments, user]);

  const teamIds = new Set(scoped.map((a) => a.employee_id));
  const activeProjectIds = new Set(scoped.map((a) => a.project_id));
  const teamSize = teamIds.size;
  const activeAssignments = scoped.length;

  // 1. Filter raw updates to only show team members
  const teamUpdates = updates.filter(
    (u) => user?.role !== "Team Lead" || teamIds.has(u.employee_id)
  );
  
  const blockers = teamUpdates.filter((u) => u.has_blocker);

  // Daily Attendance Logic (Filtered to Manager's Team)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaysTeamUpdates = teamUpdates.filter(u => u.date.startsWith(todayStr));
  const attendedEmployeeIds = new Set(todaysTeamUpdates.map(u => u.employee_id));
  
  const attendanceList = employees
    .filter(emp => user?.role !== "Team Lead" || teamIds.has(emp.id))
    .map(emp => ({
      id: emp.id,
      name: emp.full_name,
      role: emp.role,
      hasAttended: attendedEmployeeIds.has(emp.id)
    }))
    .sort((a, b) => {
      // Sort absent people to the top, then sort alphabetically
      if (a.hasAttended === b.hasAttended) return a.name.localeCompare(b.name);
      return a.hasAttended ? 1 : -1;
    });

  const attendanceCount = attendanceList.filter(e => e.hasAttended).length;

  // 2. Apply explicit user filters for the table
  const filteredUpdatesTable = teamUpdates.filter((u) => {
    if (filterProject !== "all" && u.project_id !== filterProject) return false;
    if (filterEmployee !== "all" && u.employee_id !== filterEmployee) return false;
    if (filterBlocker === "has_blocker" && !u.has_blocker) return false;
    if (filterBlocker === "no_blocker" && u.has_blocker) return false;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "—";
  const employeeName = (id: string) =>
    employees.find((e) => e.id === id)?.full_name ?? "—";

  // Map the tracked assignments to calculate variance and safely fallback the deadline.
  const tracked = scoped.map((a) => {
    const project = projects.find(p => p.id === a.project_id);
    const effectiveDeadline = a.end_date || project?.deadline || (project as any)?.end_date || null;
    
    const elapsed = elapsedPercent(a.start_date, effectiveDeadline);
    const variance = a.completion_percentage - elapsed;
    
    return { ...a, effectiveDeadline, elapsed, variance };
  });

  const atRisk = tracked.filter((t) => t.variance <= -20).length;

  const handleAssign = async () => {
    if (!assignProjectId || !assignEmpId) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    const project = projects.find((p) => p.id === assignProjectId);

    try {
      await createAssignment.mutateAsync({
        project_id: assignProjectId,
        employee_id: assignEmpId,
        reporting_lead_id: user!.id,
        allocation_percentage: assignAlloc,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: project?.deadline || (project as any)?.end_date || null,
        completion_percentage: 0,
        latest_status: null,
        features: "",
        lead_comments: "",
      });

      toast({ title: "Employee assigned successfully" });
      setAssignOpen(false);
      setAssignProjectId("");
      setAssignEmpId("");
      setAssignAlloc(50);
    } catch (e: any) {
      toast({ title: "Assignment failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Team Overview</h1>
          <p className="text-sm text-muted-foreground">
            Track delivery health and surface blockers across your team.
          </p>
        </div>
        <Button onClick={() => setAssignOpen(true)} className="gap-2 w-full sm:w-auto shrink-0">
          <UserPlus className="h-4 w-4" /> Assign Employee
        </Button>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Team size" value={teamSize} icon={Users} variant="info" />
        <KpiCard label="Active" value={activeAssignments} icon={Briefcase} variant="primary" />
        <KpiCard label="Blockers" value={blockers.length} icon={AlertOctagon} variant="destructive" hint="Needs attention" />
        <KpiCard label="At risk" value={atRisk} icon={AlertTriangle} variant="warning" hint=">20% behind" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Tracker */}
        <Card className="lg:col-span-2 shadow-sm h-fit">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <h2 className="text-base font-semibold">Automated Progress Tracker</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compares time elapsed vs actual completion. Flags &gt;20% lag.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {tracked.length === 0 && (
              <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl mx-1 sm:mx-0">
                No active team assignments.
              </div>
            )}
            {tracked.map((t) => {
              const lagging = t.variance <= -20;
              return (
                <div key={t.id} className="rounded-lg border bg-card/40 p-4 flex flex-col gap-4 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium leading-snug">
                        {projectName(t.project_id)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {employeeName(t.employee_id)}
                        {t.effectiveDeadline && ` · Due ${format(new Date(t.effectiveDeadline), "MMM d, yyyy")}`}
                      </div>
                    </div>
                    <div className="shrink-0 self-start sm:self-auto">
                      {lagging ? (
                        <StatusBadge label={`Lagging ${Math.abs(t.variance)}%`} variant="destructive" />
                      ) : t.variance >= 0 ? (
                        <StatusBadge label="On track" variant="success" />
                      ) : (
                        <StatusBadge label={`${Math.abs(t.variance)}% behind`} variant="warning" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Time elapsed</span>
                        <span>{t.elapsed}%</span>
                      </div>
                      <Progress value={t.elapsed} className="h-1.5 [&>div]:bg-muted-foreground/40 dark:[&>div]:bg-muted-foreground/60" />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Actual completion</span>
                        <span>{t.completion_percentage}%</span>
                      </div>
                      <Progress value={t.completion_percentage} className={`h-1.5 ${lagging ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* --- RIGHT COLUMN (Attendance & Blockers) --- */}
        <div className="space-y-6">
          {/* TODAY'S ATTENDANCE */}
          <Card className="shadow-sm h-fit">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" /> Today's Attendance
                </CardTitle>
                <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {attendanceCount} / {attendanceList.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[250px] overflow-y-auto">
                {attendanceList.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No team members found.</div>
                ) : (
                  attendanceList.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{emp.name}</span>
                        <span className="text-[11px] text-muted-foreground truncate">{emp.role}</span>
                      </div>
                      <div className="shrink-0">
                        {emp.hasAttended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Checked in
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Center (Blockers) */}
          <Card className="shadow-sm h-fit">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Action Center
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Recent blockers from your team.</p>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {blockers.length === 0 && (
                <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl mx-1 sm:mx-0">
                  No active blockers 🎉
                </div>
              )}
              {blockers.map((b) => (
                <div key={b.id} className="rounded-lg border-l-4 border-destructive bg-destructive/5 p-3.5 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground truncate">{employeeName(b.employee_id)}</span>
                    <span className="text-muted-foreground shrink-0 font-medium bg-background/50 px-1.5 py-0.5 rounded">
                      {format(new Date(b.date), "MMM d")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{projectName(b.project_id)}</div>
                  <p className="mt-1 text-sm text-foreground break-words whitespace-pre-wrap leading-relaxed">
                    {b.blocker_description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- ALL DAILY UPDATES TABULAR FEED --- */}
      <Card className="shadow-sm border-t-4 border-t-primary/50">
        <CardHeader className="pb-3 border-b bg-muted/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-primary" /> Daily Updates Records
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Tabular view of all updates submitted by your team.</p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects
                    .filter(p => activeProjectIds.has(p.id) || user?.role !== "Team Lead")
                    .map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees
                    .filter(e => teamIds.has(e.id) || user?.role !== "Team Lead")
                    .map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterBlocker} onValueChange={setFilterBlocker}>
                <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="has_blocker">With Blockers</SelectItem>
                  <SelectItem value="no_blocker">No Blockers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium w-[120px]">Date</th>
                  <th className="px-4 py-3 font-medium w-[160px]">Employee / Project</th>
                  <th className="px-4 py-3 font-medium w-[22%]">
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600"/> Completed</div>
                  </th>
                  <th className="px-4 py-3 font-medium w-[22%]">
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> In Progress</div>
                  </th>
                  <th className="px-4 py-3 font-medium w-[22%]">
                    <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-purple-500"/> Planned</div>
                  </th>
                  <th className="px-4 py-3 font-medium w-[180px]">
                    <div className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500"/> Blocker</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUpdatesTable.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No updates match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredUpdatesTable.map((u: any) => (
                    <tr key={u.id} className={`hover:bg-muted/10 transition-colors ${u.has_blocker ? 'bg-destructive/5' : ''}`}>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <span className="font-medium text-foreground">{format(new Date(u.date), "MMM d, yyyy")}</span>
                        <div className="text-xs text-muted-foreground mt-0.5">{u.hours_worked ? `${u.hours_worked} hours` : ""}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-foreground">{employeeName(u.employee_id)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{projectName(u.project_id)}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-[13px] whitespace-pre-wrap text-foreground/90">
                        {u.completed || u.completed_tasks || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-[13px] whitespace-pre-wrap text-foreground/90">
                        {u.in_progress || u.in_progress_tasks || "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-[13px] whitespace-pre-wrap text-muted-foreground">
                        {u.planned || u.planned_tasks || "—"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {u.has_blocker ? (
                          <div className="text-[13px] text-destructive whitespace-pre-wrap font-medium">
                            {u.blocker_description || "Blocker active without description"}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/60 italic">No blockers</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- ASSIGN EMPLOYEE MODAL --- */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Employee to Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={assignProjectId} onValueChange={setAssignProjectId}>
                <SelectTrigger><SelectValue placeholder="Select active project" /></SelectTrigger>
                <SelectContent>
                  {projects.filter((p) => p.status === "Active").map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={assignEmpId} onValueChange={setAssignEmpId}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Allocation (%)</Label>
              <Input type="number" min={0} max={100} value={assignAlloc} onChange={(e) => setAssignAlloc(Number(e.target.value))} />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground pt-1 italic bg-muted/30 p-2 rounded border">
              Note: As a Manager/Lead, you will automatically be assigned as the Reporting Lead for this assignment.
            </p>
          </div>
          <DialogFooter className="mt-4 sm:space-x-2">
            <Button variant="outline" onClick={() => setAssignOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleAssign} className="w-full sm:w-auto mt-2 sm:mt-0">Create Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}