// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { KpiCard } from "@/components/KpiCard";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { useDailyUpdates, useEmployees, useFinancials, useProjects, useTickets } from "@/hooks/useStaffArcData";
// import { 
//   Briefcase, DollarSign, Ticket as TicketIcon, Users, Clock, AlertTriangle, 
//   Table as TableIcon, Filter, CheckCircle2, CalendarDays, UserCheck, XCircle 
// } from "lucide-react";
// import { format } from "date-fns";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function AdminDashboard() {
//   const { data: employees = [] } = useEmployees();
//   const { data: projects = [] } = useProjects();
//   const { data: tickets = [] } = useTickets();
//   const { data: financials = [] } = useFinancials();
//   const { data: updates = [] } = useDailyUpdates();

//   const openTickets = tickets.filter((t) => ["New", "In Progress", "On Hold"].includes(t.state)).length;
  
//   // Updates Table Filters
//   const [filterProject, setFilterProject] = useState("all");
//   const [filterEmployee, setFilterEmployee] = useState("all");
//   const [filterBlocker, setFilterBlocker] = useState("all");

//   const portfolioWorth = useMemo(
//     () => financials.reduce((sum, f) => {
//       const worth = Number(f.project_worth) || 0;
//       const advance = Number(f.advance_amount) || 0;
//       return sum + (f.is_paid ? worth : advance);
//     }, 0),
//     [financials]
//   );
  
//   const currency = financials[0]?.currency ?? "INR";

//   const employeeName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";
//   const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

//   // Daily Attendance Logic (Checks if an employee has submitted a daily update today)
//   const todayStr = format(new Date(), "yyyy-MM-dd");
//   const todaysUpdates = updates.filter(u => u.date.startsWith(todayStr));
//   const attendedEmployeeIds = new Set(todaysUpdates.map(u => u.employee_id));
  
//   const attendanceList = employees.map(emp => ({
//     id: emp.id,
//     name: emp.full_name,
//     role: emp.role,
//     hasAttended: attendedEmployeeIds.has(emp.id)
//   })).sort((a, b) => {
//     // Sort absent people to the top, then sort alphabetically
//     if (a.hasAttended === b.hasAttended) return a.name.localeCompare(b.name);
//     return a.hasAttended ? 1 : -1;
//   });

//   const attendanceCount = attendanceList.filter(e => e.hasAttended).length;

//   // Combine recent updates and tickets into a single unified activity feed
//   const feed = [
//     ...updates.map((u) => ({
//       id: `upd-${u.id}`,
//       when: u.date,
//       type: "update" as const,
//       employee: employeeName(u.employee_id),
//       project: projectName(u.project_id),
//       hasBlocker: u.has_blocker,
//       text: u.has_blocker ? "Flagged a blocker" : "Submitted daily standup",
//     })),
//     ...tickets.map((t) => ({
//       id: `tic-${t.id}`,
//       when: t.created_at,
//       type: "ticket" as const,
//       employee: employeeName(t.created_by),
//       project: null,
//       hasBlocker: false,
//       text: `${t.ticket_number} · ${t.title}`,
//       priority: t.priority,
//     })),
//   ]
//     .sort((a, b) => (new Date(a.when).getTime() < new Date(b.when).getTime() ? 1 : -1))
//     .slice(0, 7); // Show top 7 recent items

//   // Apply filters to daily updates for the tabular view
//   const filteredUpdatesTable = [...updates]
//     .filter((u) => {
//       if (filterProject !== "all" && u.project_id !== filterProject) return false;
//       if (filterEmployee !== "all" && u.employee_id !== filterEmployee) return false;
//       if (filterBlocker === "has_blocker" && !u.has_blocker) return false;
//       if (filterBlocker === "no_blocker" && u.has_blocker) return false;
//       return true;
//     })
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   return (
//     <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
//       <div>
//         <h1 className="text-xl font-semibold sm:text-2xl">Global Overview</h1>
//         <p className="text-sm text-muted-foreground">Org-wide health across people, projects, and revenue.</p>
//       </div>

//       {/* --- KPI GRID --- */}
//       <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
//         <KpiCard label="Employees" value={employees.length} icon={Users} variant="info" />
//         <KpiCard label="Projects" value={projects.length} icon={Briefcase} variant="primary" />
//         <KpiCard label="Open Tickets" value={openTickets} icon={TicketIcon} variant="warning" />
//         <KpiCard
//           label="Portfolio Collected"
//           value={`${currency} ${(portfolioWorth / 1000).toFixed(1)}k`}
//           icon={DollarSign}
//           variant="success"
//           hint="Advances + Paid Projects"
//         />
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* --- RECENT ACTIVITY FEED --- */}
//         <Card className="lg:col-span-2 shadow-sm h-fit">
//           <CardHeader className="pb-3 border-b bg-muted/10">
//             <CardTitle className="text-base font-semibold flex items-center gap-2">
//               <Clock className="w-4 h-4 text-primary" /> Recent Activity
//             </CardTitle>
//             <CardDescription>Latest updates and tickets from your organization</CardDescription>
//           </CardHeader>
//           <CardContent className="pt-4">
//             {feed.length === 0 ? (
//               <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
//                 No recent activity across the organization.
//               </div>
//             ) : (
//               <ul className="divide-y relative">
//                 {feed.map((f) => (
//                   <li key={f.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3.5 group">
//                     <div className="flex flex-col min-w-0 gap-1 flex-1">
//                       <div className="flex items-center gap-1.5 flex-wrap">
//                         <span className="font-medium text-sm text-foreground">{f.employee}</span>
//                         {f.type === "update" ? (
//                           <span className="text-xs text-muted-foreground">on <span className="font-medium text-primary">{f.project}</span></span>
//                         ) : (
//                           <span className="text-xs text-muted-foreground">opened a ticket</span>
//                         )}
//                       </div>
                      
//                       <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
//                         <span className="truncate">{f.text}</span>
//                         {f.hasBlocker && (
//                           <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
//                             <AlertTriangle className="w-3 h-3" /> Blocker
//                           </span>
//                         )}
//                         {f.priority && (
//                           <span className="text-[10px] uppercase font-semibold text-muted-foreground border px-1.5 py-0.5 rounded">
//                             {f.priority}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="shrink-0 text-xs text-muted-foreground bg-muted/40 sm:bg-transparent px-2 sm:px-0 py-1 sm:py-0 rounded w-fit">
//                       {format(new Date(f.when), "MMM d, h:mm a")}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </CardContent>
//         </Card>

//         {/* --- RIGHT COLUMN (Attendance & Projects) --- */}
//         <div className="space-y-6">
          
//           {/* TODAY'S ATTENDANCE */}
//           <Card className="shadow-sm h-fit">
//             <CardHeader className="pb-3 border-b bg-muted/10">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-base font-semibold flex items-center gap-2">
//                   <UserCheck className="w-4 h-4 text-primary" /> Today's Attendance
//                 </CardTitle>
//                 <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
//                   {attendanceCount} / {employees.length}
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="divide-y max-h-[300px] overflow-y-auto">
//                 {attendanceList.length === 0 ? (
//                   <div className="p-6 text-center text-sm text-muted-foreground">No employees found.</div>
//                 ) : (
//                   attendanceList.map((emp) => (
//                     <div key={emp.id} className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors">
//                       <div className="flex flex-col min-w-0">
//                         <span className="text-sm font-medium truncate">{emp.name}</span>
//                         <span className="text-[11px] text-muted-foreground truncate">{emp.role}</span>
//                       </div>
//                       <div className="shrink-0">
//                         {emp.hasAttended ? (
//                           <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
//                             <CheckCircle2 className="w-3 h-3" /> Checked in
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
//                             <XCircle className="w-3 h-3" /> Pending
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* PROJECT STATUS LIST */}
//           <Card className="shadow-sm h-fit">
//             <CardHeader className="pb-3 border-b bg-muted/10">
//               <CardTitle className="text-base font-semibold flex items-center gap-2">
//                 <Briefcase className="w-4 h-4 text-primary" /> Active Projects
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               {projects.length === 0 ? (
//                 <div className="p-6 text-center text-sm text-muted-foreground">
//                   No active projects.
//                 </div>
//               ) : (
//                 <div className="divide-y max-h-[300px] overflow-y-auto">
//                   {projects.map((p) => (
//                     <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
//                       <div className="flex flex-col min-w-0">
//                         <span className="text-sm font-medium truncate">{p.name}</span>
//                         <span className="text-xs text-muted-foreground truncate">
//                           {finByProjectId(financials, p.id)?.client_name || "Internal Project"}
//                         </span>
//                       </div>
//                       <div className="shrink-0 self-start sm:self-auto">
//                         <StatusBadge label={p.status} variant={statusToVariant(p.status)} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* --- GLOBAL DAILY UPDATES TABULAR FEED --- */}
//       <Card className="shadow-sm border-t-4 border-t-primary/50">
//         <CardHeader className="pb-3 border-b bg-muted/5">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h2 className="text-base font-semibold flex items-center gap-2">
//                 <TableIcon className="w-4 h-4 text-primary" /> Daily Updates Record (Global)
//               </h2>
//               <p className="text-xs text-muted-foreground mt-0.5">Detailed task breakdown submitted across the organization.</p>
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
//                   {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
//                 </SelectContent>
//               </Select>

//               <Select value={filterEmployee} onValueChange={setFilterEmployee}>
//                 <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
//                   <SelectValue placeholder="All Employees" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Employees</SelectItem>
//                   {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
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
//               <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
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
//                     <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
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
//     </div>
//   );
// }

// // Helper to look up financials quickly for the project list
// function finByProjectId(financials: any[], projectId: string) {
//   return financials.find(f => f.project_id === projectId);
// }
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useDailyUpdates, useEmployees, useFinancials, useProjects, useTickets } from "@/hooks/useStaffArcData";
import { 
  Briefcase, DollarSign, Ticket as TicketIcon, Users, Clock, AlertTriangle, 
  Table as TableIcon, Filter, CheckCircle2, CalendarDays, UserCheck, XCircle, History
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminDashboard() {
  const { data: employees = [] } = useEmployees();
  const { data: projects = [] } = useProjects();
  const { data: tickets = [] } = useTickets();
  const { data: financials = [] } = useFinancials();
  const { data: updates = [] } = useDailyUpdates();

  const openTickets = tickets.filter((t) => ["New", "In Progress", "On Hold"].includes(t.state)).length;
  
  // Updates Table Filters
  const [filterProject, setFilterProject] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterBlocker, setFilterBlocker] = useState("all");

  const portfolioWorth = useMemo(
    () => financials.reduce((sum, f) => {
      const worth = Number(f.project_worth) || 0;
      const advance = Number(f.advance_amount) || 0;
      return sum + (f.is_paid ? worth : advance);
    }, 0),
    [financials]
  );
  
  const currency = financials[0]?.currency ?? "INR";

  const employeeName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "—";

  // Daily Attendance Logic (Checks if an employee has submitted a daily update today)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todaysUpdates = updates.filter(u => u.date.startsWith(todayStr));
  const attendedEmployeeIds = new Set(todaysUpdates.map(u => u.employee_id));
  
  const attendanceList = employees.map(emp => ({
    id: emp.id,
    name: emp.full_name,
    role: emp.role,
    hasAttended: attendedEmployeeIds.has(emp.id)
  })).sort((a, b) => {
    if (a.hasAttended === b.hasAttended) return a.name.localeCompare(b.name);
    return a.hasAttended ? 1 : -1;
  });

  const attendanceCount = attendanceList.filter(e => e.hasAttended).length;

  // 60-Day Attendance Logic
  const sixtyDaysAgo = subDays(new Date(), 60);
  const recent60Updates = updates.filter(u => isAfter(new Date(u.date), sixtyDaysAgo));

  const longTermAttendance = employees.map(emp => {
    // Get all updates for this employee in the last 60 days
    const empUpdates = recent60Updates.filter(u => u.employee_id === emp.id);
    
    // Calculate unique days they submitted an update
    const uniqueDays = new Set(empUpdates.map(u => u.date.slice(0, 10)));
    
    // Find the latest check-in date
    const latestUpdate = empUpdates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    // Generate a 7-day visual pattern (from 6 days ago to today)
    const sevenDayPattern = Array.from({ length: 7 }).map((_, i) => {
      const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      return { date: d, present: uniqueDays.has(d) };
    });

    return {
      id: emp.id,
      name: emp.full_name,
      role: emp.role,
      daysPresent: uniqueDays.size,
      lastCheckIn: latestUpdate ? latestUpdate.date : null,
      sevenDayPattern,
      hasAttendedToday: attendedEmployeeIds.has(emp.id)
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Combine recent updates and tickets into a single unified activity feed
  const feed = [
    ...updates.map((u) => ({
      id: `upd-${u.id}`,
      when: u.date,
      type: "update" as const,
      employee: employeeName(u.employee_id),
      project: projectName(u.project_id),
      hasBlocker: u.has_blocker,
      text: u.has_blocker ? "Flagged a blocker" : "Submitted daily standup",
    })),
    ...tickets.map((t) => ({
      id: `tic-${t.id}`,
      when: t.created_at,
      type: "ticket" as const,
      employee: employeeName(t.created_by),
      project: null,
      hasBlocker: false,
      text: `${t.ticket_number} · ${t.title}`,
      priority: t.priority,
    })),
  ]
    .sort((a, b) => (new Date(a.when).getTime() < new Date(b.when).getTime() ? 1 : -1))
    .slice(0, 7);

  // Apply filters to daily updates for the tabular view
  const filteredUpdatesTable = [...updates]
    .filter((u) => {
      if (filterProject !== "all" && u.project_id !== filterProject) return false;
      if (filterEmployee !== "all" && u.employee_id !== filterEmployee) return false;
      if (filterBlocker === "has_blocker" && !u.has_blocker) return false;
      if (filterBlocker === "no_blocker" && u.has_blocker) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Global Overview</h1>
        <p className="text-sm text-muted-foreground">Org-wide health across people, projects, and revenue.</p>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Employees" value={employees.length} icon={Users} variant="info" />
        <KpiCard label="Projects" value={projects.length} icon={Briefcase} variant="primary" />
        <KpiCard label="Open Tickets" value={openTickets} icon={TicketIcon} variant="warning" />
        <KpiCard
          label="Portfolio Collected"
          value={`${currency} ${(portfolioWorth / 1000).toFixed(1)}k`}
          icon={DollarSign}
          variant="success"
          hint="Advances + Paid Projects"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* --- RECENT ACTIVITY FEED --- */}
        <Card className="lg:col-span-2 shadow-sm h-fit">
          <CardHeader className="pb-3 border-b bg-muted/10">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and tickets from your organization</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {feed.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                No recent activity across the organization.
              </div>
            ) : (
              <ul className="divide-y relative">
                {feed.map((f) => (
                  <li key={f.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 py-3.5 group">
                    <div className="flex flex-col min-w-0 gap-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{f.employee}</span>
                        {f.type === "update" ? (
                          <span className="text-xs text-muted-foreground">on <span className="font-medium text-primary">{f.project}</span></span>
                        ) : (
                          <span className="text-xs text-muted-foreground">opened a ticket</span>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="truncate">{f.text}</span>
                        {f.hasBlocker && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> Blocker
                          </span>
                        )}
                        {f.priority && (
                          <span className="text-[10px] uppercase font-semibold text-muted-foreground border px-1.5 py-0.5 rounded">
                            {f.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground bg-muted/40 sm:bg-transparent px-2 sm:px-0 py-1 sm:py-0 rounded w-fit">
                      {format(new Date(f.when), "MMM d, h:mm a")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* --- RIGHT COLUMN (Attendance & Projects) --- */}
        <div className="space-y-6">
          {/* TODAY'S ATTENDANCE */}
          <Card className="shadow-sm h-fit">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" /> Today's Attendance
                </CardTitle>
                <div className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {attendanceCount} / {employees.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {attendanceList.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No employees found.</div>
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

          {/* PROJECT STATUS LIST */}
          <Card className="shadow-sm h-fit">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No active projects.
                </div>
              ) : (
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {projects.map((p) => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {finByProjectId(financials, p.id)?.client_name || "Internal Project"}
                        </span>
                      </div>
                      <div className="shrink-0 self-start sm:self-auto">
                        <StatusBadge label={p.status} variant={statusToVariant(p.status)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- TABBED SECTION: UPDATES vs ATTENDANCE --- */}
      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="updates" className="flex items-center gap-2">
            <TableIcon className="w-4 h-4" /> Global Daily Updates
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Attendance (Last 60 Days)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-0">
          <Card className="shadow-sm border-t-4 border-t-primary/50">
            <CardHeader className="pb-3 border-b bg-muted/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-primary" /> Daily Updates Record
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Detailed task breakdown submitted across the organization.</p>
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
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                    <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
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
        </TabsContent>

        <TabsContent value="attendance" className="mt-0">
          <Card className="shadow-sm border-t-4 border-t-blue-500/50">
            <CardHeader className="pb-3 border-b bg-muted/5">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" /> Employee Attendance (Last 60 Days)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Summary of updates submitted per employee over the last two months.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium w-[150px] text-center">Status Today</th>
                      <th className="px-4 py-3 font-medium w-[180px] text-center">Days Checked-In (60d)</th>
                      <th className="px-4 py-3 font-medium w-[180px]">Last Check-in Date</th>
                      <th className="px-4 py-3 font-medium w-[220px] text-center">Recent 7-Day Pattern</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {longTermAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      longTermAttendance.map((emp) => (
                        <tr key={emp.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-foreground">{emp.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{emp.role}</div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {emp.hasAttendedToday ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                                <XCircle className="w-3 h-3" /> Pending/Absent
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="font-semibold text-base">{emp.daysPresent}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Days Active</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                            {emp.lastCheckIn ? format(new Date(emp.lastCheckIn), "MMM d, yyyy") : "Never"}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {emp.sevenDayPattern.map((day, i) => (
                                <div 
                                  key={i} 
                                  title={`${day.date}: ${day.present ? 'Present' : 'Absent'}`}
                                  className={`w-4 h-4 rounded-sm ${day.present ? 'bg-green-500' : 'bg-muted border'}`} 
                                />
                              ))}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex justify-between px-6">
                              <span>Older</span>
                              <span>Today</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper to look up financials quickly for the project list
function finByProjectId(financials: any[], projectId: string) {
  return financials.find(f => f.project_id === projectId);
}