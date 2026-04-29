// import { useMemo, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { useAuth } from "@/contexts/AuthContext";
// import {
//   useAssignments,
//   useProjects,
//   useSubmitDailyUpdate,
//   useTickets,
//   useDailyUpdates,
// } from "@/hooks/useStaffArcData";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "@/hooks/use-toast";
// import {
//   CalendarDays,
//   AlertTriangle,
//   Ticket as TicketIcon,
//   History,
//   CheckCircle2,
//   Clock,
// } from "lucide-react";
// import { format, subDays, isAfter } from "date-fns";

// export default function EmployeeDashboard() {
//   const { user } = useAuth();
//   const { data: assignments = [] } = useAssignments();
//   const { data: projects = [] } = useProjects();
//   const { data: tickets = [] } = useTickets();
//   const { data: updates = [] } = useDailyUpdates();
//   const submit = useSubmitDailyUpdate();

//   const myAssignments = useMemo(
//     () => assignments.filter((a) => a.employee_id === user?.id),
//     [assignments, user],
//   );

//   const myTickets = useMemo(
//     () =>
//       tickets
//         .filter((t) => t.assigned_to === user?.id && t.state !== "Closed")
//         .slice(0, 5),
//     [tickets, user],
//   );

//   // Fetch the employee's updates from the last 7 days
//   const myRecentUpdates = useMemo(() => {
//     if (!user) return [];
//     const sevenDaysAgo = subDays(new Date(), 7);
    
//     return updates
//       .filter((u) => u.employee_id === user.id)
//       .filter((u) => isAfter(new Date(u.date), sevenDaysAgo))
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//   }, [updates, user]);

//   const projectName = (id: string) =>
//     projects.find((p) => p.id === id)?.name ?? "—";

//   const [projectId, setProjectId] = useState<string>("");
//   const [completed, setCompleted] = useState("");
//   const [inProgress, setInProgress] = useState("");
//   const [planned, setPlanned] = useState("");
//   const [hasBlocker, setHasBlocker] = useState(false);
//   const [blocker, setBlocker] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user || !projectId) {
//       toast({ title: "Pick a project first", variant: "destructive" });
//       return;
//     }
//     if (!completed.trim() && !inProgress.trim() && !planned.trim()) {
//       toast({
//         title: "Update cannot be entirely empty",
//         variant: "destructive",
//       });
//       return;
//     }

//     await submit.mutateAsync({
//       employee_id: user.id,
//       project_id: projectId,
//       date: new Date().toISOString().slice(0, 10),
//       completed,
//       in_progress: inProgress,
//       planned,
//       has_blocker: hasBlocker,
//       blocker_description: hasBlocker ? blocker : null,
//     });

//     toast({
//       title: "Update submitted",
//       description: "Your daily standup was saved.",
//     });
//     setCompleted("");
//     setInProgress("");
//     setPlanned("");
//     setHasBlocker(false);
//     setBlocker("");
//   };

//   return (
//     <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
//       <div>
//         <h1 className="text-xl font-semibold sm:text-2xl">My Workspace</h1>
//         <p className="text-sm text-muted-foreground">
//           Your active assignments, tickets, and daily check-in.
//         </p>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Left Column: Projects, Tickets, and History */}
//         <div className="space-y-6 lg:col-span-2">
          
//           {/* --- Active Assignments --- */}
//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="text-base font-semibold">
//                 Active assignments
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {myAssignments.length === 0 && (
//                 <div className="p-6 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl mx-1 sm:mx-0">
//                   You have no active project assignments right now.
//                 </div>
//               )}
//               {myAssignments.map((a) => {
//                 const project = projects.find((p) => p.id === a.project_id);
//                 return (
//                   <div
//                     key={a.id}
//                     className="rounded-lg border bg-card/50 p-4 hover:shadow-sm transition-shadow flex flex-col gap-3"
//                   >
//                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="truncate font-medium text-base">
//                           {project?.name}
//                         </div>
//                         <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-2 text-xs text-muted-foreground">
//                           <span className="flex items-center gap-1.5">
//                             <CalendarDays className="h-3.5 w-3.5" />
//                             {a.end_date
//                               ? `Due ${format(new Date(a.end_date), "MMM d, yyyy")}`
//                               : "No due date"}
//                           </span>
//                           {a.allocation_percentage != null && (
//                             <span className="hidden sm:inline">· {a.allocation_percentage}% Allocation</span>
//                           )}
//                           {a.allocation_percentage != null && (
//                             <span className="sm:hidden flex items-center gap-1.5 before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full before:bg-muted-foreground/30">
//                               {a.allocation_percentage}% Allocation
//                             </span>
//                           )}
//                         </div>
//                       </div>
                      
//                       <div className="self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
//                         <StatusBadge
//                           label={`${a.completion_percentage}% Done`}
//                           variant="primary"
//                         />
//                       </div>
//                     </div>
                    
//                     <Progress value={a.completion_percentage} className="h-2 w-full" />
//                   </div>
//                 );
//               })}
//             </CardContent>
//           </Card>

//           {/* --- Recent Tickets --- */}
//           <Card>
//             <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="flex items-center gap-2 text-base font-semibold">
//                 <TicketIcon className="h-4 w-4 text-primary shrink-0" /> 
//                 <span className="truncate">Active tickets assigned to you</span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {myTickets.length === 0 ? (
//                 <p className="text-sm text-muted-foreground py-4 text-center">
//                   No active tickets assigned.
//                 </p>
//               ) : (
//                 <ul className="divide-y">
//                   {myTickets.map((t) => (
//                     <li
//                       key={t.id}
//                       className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5"
//                     >
//                       <div className="min-w-0">
//                         <div className="text-sm font-medium leading-snug sm:truncate">
//                           {t.title}
//                         </div>
//                         <div className="font-mono text-xs text-muted-foreground mt-1 bg-muted/50 inline-block px-1.5 py-0.5 rounded">
//                           {t.ticket_number}
//                         </div>
//                       </div>
//                       <div className="flex shrink-0 flex-wrap items-center gap-2 mt-1 sm:mt-0">
//                         <StatusBadge
//                           label={t.priority}
//                           variant={statusToVariant(t.priority)}
//                         />
//                         <StatusBadge
//                           label={t.state}
//                           variant={statusToVariant(t.state)}
//                         />
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </CardContent>
//           </Card>

//           {/* --- My Recent Updates (Read Only) --- */}
//           <Card>
//             <CardHeader className="pb-2 bg-muted/10 border-b">
//               <CardTitle className="flex items-center gap-2 text-base font-semibold">
//                 <History className="h-4 w-4 text-primary" /> 
//                 My Recent Updates (Past 7 Days)
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-4 space-y-4">
//               {myRecentUpdates.length === 0 ? (
//                 <div className="p-6 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl mx-1 sm:mx-0">
//                   No daily updates submitted in the last 7 days.
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {myRecentUpdates.map((u: any) => (
//                     <div 
//                       key={u.id} 
//                       className={`rounded-lg border p-4 text-sm ${u.has_blocker ? 'border-destructive/40 bg-destructive/5' : 'bg-card'}`}
//                     >
//                       <div className="flex items-center justify-between border-b pb-2 mb-3">
//                         <div className="font-semibold text-foreground">{projectName(u.project_id)}</div>
//                         <div className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded">
//                           {format(new Date(u.date), "EEEE, MMM d")}
//                         </div>
//                       </div>
                      
//                       <div className="space-y-3">
//                         {/* Completed Section */}
//                         {(u.completed || u.completed_tasks) && (
//                           <div>
//                             <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-1">
//                               <CheckCircle2 className="w-3.5 h-3.5" /> Completed
//                             </div>
//                             <div className="text-muted-foreground text-[13px] whitespace-pre-wrap pl-5 border-l-2 border-green-200 dark:border-green-900 ml-1.5">
//                               {u.completed || u.completed_tasks}
//                             </div>
//                           </div>
//                         )}

//                         {/* In Progress Section */}
//                         {(u.in_progress || u.in_progress_tasks) && (
//                           <div>
//                             <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mb-1">
//                               <Clock className="w-3.5 h-3.5" /> In Progress
//                             </div>
//                             <div className="text-muted-foreground text-[13px] whitespace-pre-wrap pl-5 border-l-2 border-blue-200 dark:border-blue-900 ml-1.5">
//                               {u.in_progress || u.in_progress_tasks}
//                             </div>
//                           </div>
//                         )}

//                         {/* Planned Section */}
//                         {(u.planned || u.planned_tasks) && (
//                           <div>
//                             <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 mb-1">
//                               <CalendarDays className="w-3.5 h-3.5" /> Planned for tomorrow
//                             </div>
//                             <div className="text-muted-foreground text-[13px] whitespace-pre-wrap pl-5 border-l-2 border-purple-200 dark:border-purple-900 ml-1.5">
//                               {u.planned || u.planned_tasks}
//                             </div>
//                           </div>
//                         )}

//                         {/* Blocker Section */}
//                         {u.has_blocker && (
//                           <div className="mt-2 pt-2 border-t border-destructive/20">
//                             <div className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-wider mb-1">
//                               <AlertTriangle className="w-3.5 h-3.5" /> Blocker Logged
//                             </div>
//                             <div className="text-destructive/90 text-[13px] whitespace-pre-wrap pl-5 ml-1.5">
//                               {u.blocker_description || "No description provided."}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column: Daily Update Form */}
//         <div className="lg:col-span-1">
//           <Card className="h-fit lg:sticky lg:top-20 shadow-md border-primary/20 flex flex-col">
//             <CardHeader className="pb-3 bg-muted/20 border-b">
//               <CardTitle className="text-base font-semibold">
//                 Submit Daily Update
//               </CardTitle>
//               <CardDescription className="text-xs mt-1">
//                 {format(new Date(), "EEEE, MMMM do, yyyy")}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="pt-5">
//               <form className="space-y-5" onSubmit={handleSubmit}>
//                 <div className="space-y-2">
//                   <Label className="text-sm">
//                     Project <span className="text-destructive">*</span>
//                   </Label>
//                   <Select value={projectId} onValueChange={setProjectId} required>
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select a project" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {myAssignments.map((a) => (
//                         <SelectItem key={a.id} value={a.project_id}>
//                           {projectName(a.project_id)}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm">Completed today</Label>
//                   <Textarea
//                     rows={2}
//                     className="resize-none"
//                     value={completed}
//                     onChange={(e) => setCompleted(e.target.value)}
//                     placeholder="What did you ship?"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm">In progress</Label>
//                   <Textarea
//                     rows={2}
//                     className="resize-none"
//                     value={inProgress}
//                     onChange={(e) => setInProgress(e.target.value)}
//                     placeholder="What are you working on right now?"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm">Planned for tomorrow</Label>
//                   <Textarea
//                     rows={2}
//                     className="resize-none"
//                     value={planned}
//                     onChange={(e) => setPlanned(e.target.value)}
//                     placeholder="What's next on your plate?"
//                   />
//                 </div>

//                 <div
//                   className={`flex flex-row items-center justify-between rounded-lg border p-3.5 transition-colors ${
//                     hasBlocker ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900" : "bg-transparent"
//                   }`}
//                 >
//                   <div className="flex items-center gap-2.5">
//                     <AlertTriangle
//                       className={`h-4 w-4 ${hasBlocker ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
//                     />
//                     <Label
//                       htmlFor="blk"
//                       className={`cursor-pointer text-sm ${hasBlocker ? "text-red-900 dark:text-red-400 font-semibold" : ""}`}
//                     >
//                       I am blocked
//                     </Label>
//                   </div>
//                   <Switch
//                     id="blk"
//                     checked={hasBlocker}
//                     onCheckedChange={setHasBlocker}
//                   />
//                 </div>

//                 {hasBlocker && (
//                   <div className="animate-in fade-in slide-in-from-top-2 pt-1">
//                     <Textarea
//                       rows={3}
//                       className="border-red-300 dark:border-red-800 focus-visible:ring-red-500 resize-none"
//                       value={blocker}
//                       onChange={(e) => setBlocker(e.target.value)}
//                       placeholder="Describe the blocker so your lead can help..."
//                       required
//                     />
//                   </div>
//                 )}

//                 <Button
//                   type="submit"
//                   disabled={submit.isPending}
//                   className="w-full mt-2 py-5 sm:py-2"
//                 >
//                   {submit.isPending ? "Submitting..." : "Submit Update"}
//                 </Button>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAssignments,
  useProjects,
  useSubmitDailyUpdate,
  useTickets,
  useDailyUpdates,
} from "@/hooks/useStaffArcData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  CalendarDays,
  AlertTriangle,
  Ticket as TicketIcon,
  History,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: projects = [] } = useProjects();
  const { data: tickets = [] } = useTickets();
  const { data: updates = [] } = useDailyUpdates();
  const submit = useSubmitDailyUpdate();

  const myAssignments = useMemo(
    () => assignments.filter((a) => a.employee_id === user?.id),
    [assignments, user],
  );

  const myTickets = useMemo(
    () =>
      tickets
        .filter((t) => t.assigned_to === user?.id && t.state !== "Closed")
        .slice(0, 5),
    [tickets, user],
  );

  // Fetch the employee's updates from the last 7 days
  const myRecentUpdates = useMemo(() => {
    if (!user) return [];
    const sevenDaysAgo = subDays(new Date(), 7);
    
    return updates
      .filter((u) => u.employee_id === user.id)
      .filter((u) => isAfter(new Date(u.date), sevenDaysAgo))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [updates, user]);

  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "—";

  const [projectId, setProjectId] = useState<string>("");
  const [projectSearch, setProjectSearch] = useState<string>("");
  const [completed, setCompleted] = useState("");
  const [inProgress, setInProgress] = useState("");
  const [planned, setPlanned] = useState("");
  const [hasBlocker, setHasBlocker] = useState(false);
  const [blocker, setBlocker] = useState("");

  // Filter for Eligible Projects (Not completed, and matches search query)
  const eligibleAssignments = useMemo(() => {
    return myAssignments.filter((a) => {
      const p = projects.find((proj) => proj.id === a.project_id);
      
      // Do not allow updates for completed projects
      if (p?.status === "Completed") return false;
      
      // Apply search query
      if (projectSearch) {
        return p?.name.toLowerCase().includes(projectSearch.toLowerCase());
      }
      
      return true;
    });
  }, [myAssignments, projects, projectSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId) {
      toast({ title: "Pick a project first", variant: "destructive" });
      return;
    }
    if (!completed.trim() && !inProgress.trim() && !planned.trim()) {
      toast({
        title: "Update cannot be entirely empty",
        variant: "destructive",
      });
      return;
    }

    await submit.mutateAsync({
      employee_id: user.id,
      project_id: projectId,
      date: new Date().toISOString().slice(0, 10),
      completed,
      in_progress: inProgress,
      planned,
      has_blocker: hasBlocker,
      blocker_description: hasBlocker ? blocker : null,
    });

    toast({
      title: "Update submitted",
      description: "Your daily standup was saved.",
    });
    setCompleted("");
    setInProgress("");
    setPlanned("");
    setHasBlocker(false);
    setBlocker("");
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">My Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Your active assignments, tickets, and daily check-in.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Projects, Tickets, and History */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* --- Active Assignments --- */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Active assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myAssignments.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl mx-1 sm:mx-0">
                  You have no active project assignments right now.
                </div>
              )}
              {myAssignments.map((a) => {
                const project = projects.find((p) => p.id === a.project_id);
                return (
                  <div
                    key={a.id}
                    className="rounded-lg border bg-card/50 p-4 hover:shadow-sm transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-base">
                          {project?.name}
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
  <CalendarDays className="h-3.5 w-3.5" />
  {project?.deadline 
    ? `Due ${format(new Date(project.deadline), "MMM d, yyyy")}`
    : a.end_date 
      ? `Due ${format(new Date(a.end_date), "MMM d, yyyy")}` 
      : "No due date"}
</span>
                          {a.allocation_percentage != null && (
                            <span className="hidden sm:inline">· {a.allocation_percentage}% Allocation</span>
                          )}
                          {a.allocation_percentage != null && (
                            <span className="sm:hidden flex items-center gap-1.5 before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full before:bg-muted-foreground/30">
                              {a.allocation_percentage}% Allocation
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                        <StatusBadge
                          label={`${a.completion_percentage}% Done`}
                          variant="primary"
                        />
                      </div>
                    </div>
                    
                    <Progress value={a.completion_percentage} className="h-2 w-full" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* --- Recent Tickets --- */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <TicketIcon className="h-4 w-4 text-primary shrink-0" /> 
                <span className="truncate">Active tickets assigned to you</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No active tickets assigned.
                </p>
              ) : (
                <ul className="divide-y">
                  {myTickets.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-snug sm:truncate">
                          {t.title}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground mt-1 bg-muted/50 inline-block px-1.5 py-0.5 rounded">
                          {t.ticket_number}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 mt-1 sm:mt-0">
                        <StatusBadge
                          label={t.priority}
                          variant={statusToVariant(t.priority)}
                        />
                        <StatusBadge
                          label={t.state}
                          variant={statusToVariant(t.state)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* --- My Recent Updates (Read Only) --- */}
          <Card>
            <CardHeader className="pb-2 bg-muted/10 border-b">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <History className="h-4 w-4 text-primary" /> 
                My Recent Updates (Past 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {myRecentUpdates.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl mx-1 sm:mx-0">
                  No daily updates submitted in the last 7 days.
                </div>
              ) : (
                <div className="space-y-4">
                  {myRecentUpdates.map((u: any) => (
                    <div 
                      key={u.id} 
                      className={`rounded-lg border p-4 text-sm ${u.has_blocker ? 'border-destructive/40 bg-destructive/5' : 'bg-card'}`}
                    >
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <div className="font-semibold text-foreground">{projectName(u.project_id)}</div>
                        <div className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded">
                          {format(new Date(u.date), "EEEE, MMM d")}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Completed Section */}
                        {(u.completed || u.completed_tasks) && (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </div>
                            <div className="text-muted-foreground text-[13px] whitespace-pre-wrap pl-5 border-l-2 border-green-200 dark:border-green-900 ml-1.5">
                              {u.completed || u.completed_tasks}
                            </div>
                          </div>
                        )}

                        {/* In Progress Section */}
                        {(u.in_progress || u.in_progress_tasks) && (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mb-1">
                              <Clock className="w-3.5 h-3.5" /> In Progress
                            </div>
                            <div className="text-muted-foreground text-[13px] whitespace-pre-wrap pl-5 border-l-2 border-blue-200 dark:border-blue-900 ml-1.5">
                              {u.in_progress || u.in_progress_tasks}
                            </div>
                          </div>
                        )}

                        {/* Planned Section */}
                        {(u.planned || u.planned_tasks) && (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-500 mb-1">
                              <CalendarDays className="w-3.5 h-3.5" /> Planned for tomorrow
                            </div>
                            <div className="text-muted-foreground text-[13px] whitespace-pre-wrap pl-5 border-l-2 border-purple-200 dark:border-purple-900 ml-1.5">
                              {u.planned || u.planned_tasks}
                            </div>
                          </div>
                        )}

                        {/* Blocker Section */}
                        {u.has_blocker && (
                          <div className="mt-2 pt-2 border-t border-destructive/20">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-wider mb-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Blocker Logged
                            </div>
                            <div className="text-destructive/90 text-[13px] whitespace-pre-wrap pl-5 ml-1.5">
                              {u.blocker_description || "No description provided."}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Daily Update Form */}
        <div className="lg:col-span-1">
          <Card className="h-fit lg:sticky lg:top-20 shadow-md border-primary/20 flex flex-col">
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <CardTitle className="text-base font-semibold">
                Submit Daily Update
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-sm">
                    Project <span className="text-destructive">*</span>
                  </Label>
                  <Select value={projectId} onValueChange={setProjectId} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an active project" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 sticky top-0 bg-popover/95 backdrop-blur z-10 border-b mb-1">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()} // Prevents spacebar from closing dropdown
                            className="pl-9 h-8 bg-background"
                          />
                        </div>
                      </div>
                      
                      {eligibleAssignments.length === 0 ? (
                        <div className="p-3 text-center text-xs text-muted-foreground">
                          {projectSearch ? "No matches found" : "No active assignments"}
                        </div>
                      ) : (
                        eligibleAssignments.map((a) => (
                          <SelectItem key={a.id} value={a.project_id}>
                            {projectName(a.project_id)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Completed today</Label>
                  <Textarea
                    rows={2}
                    className="resize-none"
                    value={completed}
                    onChange={(e) => setCompleted(e.target.value)}
                    placeholder="What did you ship?"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">In progress</Label>
                  <Textarea
                    rows={2}
                    className="resize-none"
                    value={inProgress}
                    onChange={(e) => setInProgress(e.target.value)}
                    placeholder="What are you working on right now?"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Planned for tomorrow</Label>
                  <Textarea
                    rows={2}
                    className="resize-none"
                    value={planned}
                    onChange={(e) => setPlanned(e.target.value)}
                    placeholder="What's next on your plate?"
                  />
                </div>

                <div
                  className={`flex flex-row items-center justify-between rounded-lg border p-3.5 transition-colors ${
                    hasBlocker ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900" : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle
                      className={`h-4 w-4 ${hasBlocker ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
                    />
                    <Label
                      htmlFor="blk"
                      className={`cursor-pointer text-sm ${hasBlocker ? "text-red-900 dark:text-red-400 font-semibold" : ""}`}
                    >
                      I am blocked
                    </Label>
                  </div>
                  <Switch
                    id="blk"
                    checked={hasBlocker}
                    onCheckedChange={setHasBlocker}
                  />
                </div>

                {hasBlocker && (
                  <div className="animate-in fade-in slide-in-from-top-2 pt-1">
                    <Textarea
                      rows={3}
                      className="border-red-300 dark:border-red-800 focus-visible:ring-red-500 resize-none"
                      value={blocker}
                      onChange={(e) => setBlocker(e.target.value)}
                      placeholder="Describe the blocker so your lead can help..."
                      required
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submit.isPending}
                  className="w-full mt-2 py-5 sm:py-2"
                >
                  {submit.isPending ? "Submitting..." : "Submit Update"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
