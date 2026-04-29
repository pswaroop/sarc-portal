// import { useMemo, useState } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { useAuth } from "@/contexts/AuthContext";
// import {
//   useAssignments,
//   useEmployees,
//   useProjects,
//   useUpdateAssignment,
//   useUpdateProject,
// } from "@/hooks/useStaffArcData";
// import { format } from "date-fns";
// import { CheckCircle2, MessageSquare, Calendar, Pencil, Search, Users } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "@/hooks/use-toast";
// import type { ProjectAssignment, Project } from "@/types";

// export default function EmployeeProjects() {
//   const { user } = useAuth();
//   const { data: assignments = [] } = useAssignments();
//   const { data: projects = [] } = useProjects();
//   const { data: employees = [] } = useEmployees();
  
//   const updateAssignment = useUpdateAssignment();
//   const updateProject = useUpdateProject();

//   // Filters State
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");

//   // Edit Modal State
//   const [editAssignment, setEditAssignment] = useState<ProjectAssignment | null>(null);
//   const [editProjectStatus, setEditProjectStatus] = useState<string>("Active");

//   const project = (id: string) => projects.find((p) => p.id === id);
//   const empName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

//   // Filtered assignments based on user, search, and status
//   const my = useMemo(() => {
//     return assignments.filter((a) => {
//       // 1. Must belong to the current user OR the user is the Reporting Lead
//       const isMyTask = a.employee_id === user?.id;
//       const amITheLead = a.reporting_lead_id === user?.id;
      
//       if (!isMyTask && !amITheLead) return false;

//       const p = project(a.project_id);

//       // 2. Apply Status Filter
//       if (statusFilter !== "all" && p?.status !== statusFilter) return false;

//       // 3. Apply Search Filter (searches project name, employee name, and assigned features)
//       if (searchQuery) {
//         const query = searchQuery.toLowerCase();
//         const pName = p?.name?.toLowerCase() || "";
//         const features = a.features?.toLowerCase() || "";
//         const eName = empName(a.employee_id).toLowerCase();
        
//         if (!pName.includes(query) && !features.includes(query) && !eName.includes(query)) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }, [assignments, user, projects, searchQuery, statusFilter]);

//   const handleOpenEdit = (a: ProjectAssignment, p?: Project) => {
//     setEditAssignment({ ...a });
//     setEditProjectStatus(p?.status || "Active");
//   };

//   const handleUpdate = async () => {
//     if (!editAssignment) return;
    
//     try {
//       // 1. Update the employee's assignment (Progress, Features, Updates)
//       await updateAssignment.mutateAsync({
//         id: editAssignment.id,
//         completion_percentage: editAssignment.completion_percentage,
//         features: editAssignment.features,
//         latest_status: editAssignment.latest_status,
//         lead_comments: editAssignment.lead_comments, // In case a Lead updates their comments
//       });

//       // 2. Update the Project Status if it changed
//       const p = project(editAssignment.project_id);
//       if (p && p.status !== editProjectStatus) {
//         await updateProject.mutateAsync({
//           id: p.id,
//           name: p.name,
//           status: editProjectStatus,
//           deadline: p.deadline || null,
//           sprints: p.sprints || null,
//         });
//       }

//       toast({ title: "Updates saved successfully" });
//       setEditAssignment(null);
//     } catch (error: any) {
//       toast({ 
//         title: "Failed to update", 
//         description: error.message || "Database permission denied.", 
//         variant: "destructive" 
//       });
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold">Projects Dashboard</h1>
//           <p className="text-sm text-muted-foreground">
//             Detailed view of your assignments and your team's progress.
//           </p>
//         </div>
//       </div>

//       {/* --- FILTER TOOLBAR --- */}
//       <div className="flex flex-col sm:flex-row gap-3">
//         <div className="relative max-w-sm w-full">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input 
//             placeholder="Search projects, features, or assignees..." 
//             className="pl-9" 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Select value={statusFilter} onValueChange={setStatusFilter}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="All Statuses" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Statuses</SelectItem>
//             <SelectItem value="Active">Active</SelectItem>
//             <SelectItem value="Backlog">Backlog</SelectItem>
//             <SelectItem value="Completed">Completed</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* --- PROJECTS GRID --- */}
//       <div className="grid gap-5 md:grid-cols-2">
//         {my.map((a) => {
//           const p = project(a.project_id);
//           const isMyTask = a.employee_id === user?.id;
          
//           return (
//             <Card
//               key={a.id}
//               className="shadow-card hover:shadow-md transition-shadow flex flex-col group relative"
//             >
//               <CardHeader className="pb-3 border-b bg-muted/20">
//                 <div className="flex items-start justify-between pr-8">
//                   <div>
//                     <h3 className="font-semibold text-lg">{p?.name}</h3>
//                     <div className="flex items-center gap-3 mt-1.5">
//                       {(() => {
//   // 1. Find the parent project for this assignment
//   const project = projects.find((p) => p.id === a.project_id);
  
//   // 2. Use the assignment's end date, or fallback to the project's deadline
//   const effectiveDeadline = a.end_date || project?.deadline;

//   return (
//     <p className="text-xs text-muted-foreground flex items-center gap-1.5">
//       <Calendar className="w-3.5 h-3.5" /> 
//       {effectiveDeadline 
//         ? format(new Date(effectiveDeadline), "MMM d, yyyy") 
//         : "No deadline"}
//     </p>
//   );
// })()}
                      
//                       {/* Visual indicator of who owns the task */}
//                       {isMyTask ? (
//                         <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
//                           My Task
//                         </span>
//                       ) : (
//                         <span className="text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
//                           <Users className="w-3 h-3" />
//                           Managing: {empName(a.employee_id)}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   <StatusBadge
//                     label={p?.status ?? "—"}
//                     variant={statusToVariant(p?.status ?? "")}
//                   />
//                 </div>
//                 {/* Edit Button */}
//                 <Button 
//                   size="icon" 
//                   variant="ghost" 
//                   className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary"
//                   onClick={() => handleOpenEdit(a, p)} 
//                 >
//                   <Pencil className="h-4 w-4" />
//                 </Button>
//               </CardHeader>

//               <CardContent className="space-y-5 pt-4 flex-1 flex flex-col justify-between">
//                 <div>
//                   <div className="mb-1.5 flex items-center justify-between text-xs">
//                     <span className="text-muted-foreground font-medium">
//                       {isMyTask ? "My Progress" : `${empName(a.employee_id)}'s Progress`}
//                     </span>
//                     <span className="font-bold text-primary">
//                       {a.completion_percentage}%
//                     </span>
//                   </div>
//                   <Progress value={a.completion_percentage} className="h-2.5" />
//                 </div>

//                 <div className="flex-1">
//                   <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                     Assigned Features
//                   </div>
//                   {a.features ? (
//                     <ul className="space-y-2">
//                       {a.features
//                         .split(/[\n,]/)
//                         .map((f) => f.trim())
//                         .filter(Boolean)
//                         .map((f) => (
//                           <li
//                             key={f}
//                             className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded-md"
//                           >
//                             <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
//                             <span>{f}</span>
//                           </li>
//                         ))}
//                     </ul>
//                   ) : (
//                     <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
//                       No specific features listed for this assignment.
//                     </p>
//                   )}
//                 </div>

//                 <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-4 mt-auto">
//                   <div className="mb-2 flex items-center justify-between text-xs font-medium text-blue-800 dark:text-blue-300">
//                     <span className="flex items-center gap-1.5">
//                       <MessageSquare className="h-4 w-4" /> Notes from Lead
//                     </span>
//                   </div>
//                   <p className="text-sm text-muted-foreground">
//                     {a.lead_comments || "No comments from lead yet."}
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}

//         {my.length === 0 && (
//           <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
//             <h3 className="text-lg font-medium text-muted-foreground">
//               No matching projects
//             </h3>
//             <p className="text-sm text-muted-foreground mt-1">
//               {searchQuery || statusFilter !== "all" 
//                 ? "Try adjusting your search or filters." 
//                 : "When a manager assigns you to a project, it will appear here."}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* --- EDIT ASSIGNMENT & PROJECT MODAL --- */}
//       <Dialog open={!!editAssignment} onOpenChange={(o) => !o && setEditAssignment(null)}>
//         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Update Progress & Status</DialogTitle>
//           </DialogHeader>
//           {editAssignment && (
//             <div className="space-y-4 pt-2">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <Label>Completion (%)</Label>
//                   <Input 
//                     type="number" 
//                     min="0" 
//                     max="100" 
//                     value={editAssignment.completion_percentage} 
//                     onChange={(e) => setEditAssignment({ ...editAssignment, completion_percentage: Number(e.target.value) })}
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Overall Project Status</Label>
//                   <Select value={editProjectStatus} onValueChange={setEditProjectStatus}>
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Active">Active</SelectItem>
//                       <SelectItem value="Backlog">Backlog</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
              
//               <div className="space-y-1.5">
//                 <Label>Assigned Features</Label>
//                 <Textarea 
//                   rows={3} 
//                   value={editAssignment.features || ""} 
//                   placeholder="E.g. Login system, Database schema..."
//                   onChange={(e) => setEditAssignment({ ...editAssignment, features: e.target.value })}
//                 />
//                 <p className="text-[10px] text-muted-foreground">Separate multiple features with commas or new lines.</p>
//               </div>
              
//               <div className="space-y-1.5">
//                 <Label>Employee's Latest Update</Label>
//                 <Textarea 
//                   rows={2} 
//                   value={editAssignment.latest_status || ""} 
//                   placeholder="What is the current status of these tasks?"
//                   onChange={(e) => setEditAssignment({ ...editAssignment, latest_status: e.target.value })}
//                 />
//               </div>

//               {/* If the current user is the Reporting Lead, they can add comments here */}
//               {editAssignment.reporting_lead_id === user?.id && (
//                 <div className="space-y-1.5 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-900 mt-2">
//                   <Label className="text-blue-800 dark:text-blue-300">Lead Comments (Your Feedback)</Label>
//                   <Textarea 
//                     rows={2} 
//                     className="bg-white dark:bg-background"
//                     value={editAssignment.lead_comments || ""} 
//                     placeholder="Leave feedback or instructions for the assignee..."
//                     onChange={(e) => setEditAssignment({ ...editAssignment, lead_comments: e.target.value })}
//                   />
//                 </div>
//               )}
//             </div>
//           )}
//           <DialogFooter className="mt-4">
//             <Button variant="outline" onClick={() => setEditAssignment(null)}>Cancel</Button>
//             <Button onClick={handleUpdate}>Save Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAssignments,
  useEmployees,
  useProjects,
  useUpdateAssignment,
  useUpdateProject,
} from "@/hooks/useStaffArcData";
import { format } from "date-fns";
import { CheckCircle2, MessageSquare, Calendar, Pencil, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { ProjectAssignment, Project } from "@/types";

export default function EmployeeProjects() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: projects = [] } = useProjects();
  const { data: employees = [] } = useEmployees();
  
  const updateAssignment = useUpdateAssignment();
  const updateProject = useUpdateProject();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Edit Modal State
  const [editAssignment, setEditAssignment] = useState<ProjectAssignment | null>(null);
  const [editProjectStatus, setEditProjectStatus] = useState<string>("Active");

  const project = (id: string) => projects.find((p) => p.id === id);
  const empName = (id: string) => employees.find((e) => e.id === id)?.full_name ?? "—";

  // Filtered assignments based on user, search, and status
  const my = useMemo(() => {
    return assignments.filter((a) => {
      // 1. Must belong to the current user OR the user is the Reporting Lead
      const isMyTask = a.employee_id === user?.id;
      const amITheLead = a.reporting_lead_id === user?.id;
      
      if (!isMyTask && !amITheLead) return false;

      const p = project(a.project_id);

      // 2. Apply Status Filter
      if (statusFilter !== "all" && p?.status !== statusFilter) return false;

      // 3. Apply Search Filter (searches project name, employee name, and assigned features)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const pName = p?.name?.toLowerCase() || "";
        const features = a.features?.toLowerCase() || "";
        const eName = empName(a.employee_id).toLowerCase();
        
        if (!pName.includes(query) && !features.includes(query) && !eName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, user, projects, searchQuery, statusFilter]);

  const handleOpenEdit = (a: ProjectAssignment, p?: Project) => {
    setEditAssignment({ ...a });
    setEditProjectStatus(p?.status || "Active");
  };

  const handleUpdate = async () => {
    if (!editAssignment) return;
    
    try {
      // 1. Update the employee's assignment (Progress, Features, Updates)
      await updateAssignment.mutateAsync({
        id: editAssignment.id,
        completion_percentage: editAssignment.completion_percentage,
        features: editAssignment.features,
        latest_status: editAssignment.latest_status,
        lead_comments: editAssignment.lead_comments, // In case a Lead updates their comments
      });

      // 2. Update the Project Status if it changed
      const p = project(editAssignment.project_id);
      if (p && p.status !== editProjectStatus) {
        await updateProject.mutateAsync({
          id: p.id,
          name: p.name,
          status: editProjectStatus,
          deadline: p.deadline || null,
          sprints: p.sprints || null,
        });
      }

      toast({ title: "Updates saved successfully" });
      setEditAssignment(null);
    } catch (error: any) {
      toast({ 
        title: "Failed to update", 
        description: error.message || "Database permission denied.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Detailed view of your assignments and your team's progress.
          </p>
        </div>
      </div>

      {/* --- FILTER TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects, features, or assignees..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Backlog">Backlog</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- PROJECTS GRID --- */}
      <div className="grid gap-5 md:grid-cols-2">
        {my.map((a) => {
          const p = project(a.project_id);
          const isMyTask = a.employee_id === user?.id;
          
          return (
            <Card
              key={a.id}
              className="shadow-card hover:shadow-md transition-shadow flex flex-col group relative"
            >
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-start justify-between pr-8">
                  <div>
                    <h3 className="font-semibold text-lg">{p?.name || "Unknown Project"}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      
                      {/* SAFELY FETCH AND RENDER DEADLINE */}
{(() => {
  const p = projects.find((proj) => proj.id === a.project_id);

  // Aggressively check every possible place the date could be hiding, 
  // ignoring empty strings or literal "null" strings
  const effectiveDeadline =
                          // 1. Always prioritize the live parent project deadline
                          p?.deadline &&
                          p.deadline.trim() !== "" &&
                          p.deadline !== "null"
                            ? p.deadline
                            : // 2. Fallback to the assignment's end date if project deadline is empty
                              a.end_date &&
                                a.end_date.trim() !== "" &&
                                a.end_date !== "null"
                              ? a.end_date
                              : // 3. Fallback edge cases
                                (p as any)?.end_date &&
                                  (p as any).end_date.trim() !== ""
                                ? (p as any).end_date
                                : null;

  return (
    <div className="flex flex-col">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" /> 
        {effectiveDeadline 
          ? format(new Date(effectiveDeadline), "MMM d, yyyy") 
          : "No deadline"}
      </p>
      
      {/* 🔴 TEMPORARY DEBUG TEXT - This will tell you exactly why it's failing */}
      {!effectiveDeadline && (
        <p className="text-[10px] text-red-500 font-mono mt-0.5">
          {JSON.stringify(p?.deadline)}
        </p>
      )}
    </div>
  );
})()}
                      
                      {/* Visual indicator of who owns the task */}
                      {isMyTask ? (
                        <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          My Task
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Managing: {empName(a.employee_id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge
                    label={p?.status ?? "—"}
                    variant={statusToVariant(p?.status ?? "")}
                  />
                </div>
                {/* Edit Button */}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-4 right-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary"
                  onClick={() => handleOpenEdit(a, p)} 
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-5 pt-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      {isMyTask ? "My Progress" : `${empName(a.employee_id)}'s Progress`}
                    </span>
                    <span className="font-bold text-primary">
                      {a.completion_percentage}%
                    </span>
                  </div>
                  <Progress value={a.completion_percentage} className="h-2.5" />
                </div>

                <div className="flex-1">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned Features
                  </div>
                  {a.features ? (
                    <ul className="space-y-2">
                      {a.features
                        .split(/[\n,]/)
                        .map((f) => f.trim())
                        .filter(Boolean)
                        .map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded-md"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
                      No specific features listed for this assignment.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-4 mt-auto">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-blue-800 dark:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" /> Notes from Lead
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.lead_comments || "No comments from lead yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {my.length === 0 && (
          <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <h3 className="text-lg font-medium text-muted-foreground">
              No matching projects
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters." 
                : "When a manager assigns you to a project, it will appear here."}
            </p>
          </div>
        )}
      </div>

      {/* --- EDIT ASSIGNMENT & PROJECT MODAL --- */}
      <Dialog open={!!editAssignment} onOpenChange={(o) => !o && setEditAssignment(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Progress & Status</DialogTitle>
          </DialogHeader>
          {editAssignment && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Completion (%)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={editAssignment.completion_percentage} 
                    onChange={(e) => setEditAssignment({ ...editAssignment, completion_percentage: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Overall Project Status</Label>
                  <Select value={editProjectStatus} onValueChange={setEditProjectStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label>Assigned Features</Label>
                <Textarea 
                  rows={3} 
                  value={editAssignment.features || ""} 
                  placeholder="E.g. Login system, Database schema..."
                  onChange={(e) => setEditAssignment({ ...editAssignment, features: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground">Separate multiple features with commas or new lines.</p>
              </div>
              
              <div className="space-y-1.5">
                <Label>Employee's Latest Update</Label>
                <Textarea 
                  rows={2} 
                  value={editAssignment.latest_status || ""} 
                  placeholder="What is the current status of these tasks?"
                  onChange={(e) => setEditAssignment({ ...editAssignment, latest_status: e.target.value })}
                />
              </div>

              {/* If the current user is the Reporting Lead, they can add comments here */}
              {editAssignment.reporting_lead_id === user?.id && (
                <div className="space-y-1.5 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-900 mt-2">
                  <Label className="text-blue-800 dark:text-blue-300">Lead Comments (Your Feedback)</Label>
                  <Textarea 
                    rows={2} 
                    className="bg-white dark:bg-background"
                    value={editAssignment.lead_comments || ""} 
                    placeholder="Leave feedback or instructions for the assignee..."
                    onChange={(e) => setEditAssignment({ ...editAssignment, lead_comments: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditAssignment(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
