// import { useMemo } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { KpiCard } from "@/components/KpiCard";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   useAssignments,
//   useAttendance,
//   useDailyUpdates,
//   useEmployees,
//   useProjects,
//   useTickets,
// } from "@/hooks/useStaffArcData";
// import { useAuth } from "@/contexts/AuthContext";
// import {
//   Activity,
//   Award,
//   CheckCircle2,
//   Clock,
//   Download,
//   Gauge,
//   TrendingDown,
//   TrendingUp,
// } from "lucide-react";
// import {
//   differenceInCalendarDays,
//   format,
//   subDays,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   isWithinInterval,
// } from "date-fns";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Cell,
//   Legend,
//   Line,
//   LineChart,
//   Pie,
//   PieChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { toast } from "@/hooks/use-toast";

// // --- Utility Functions ---
// function elapsedPercent(start: string | null, end: string | null): number {
//   if (!start || !end) return 0;
//   const total = differenceInCalendarDays(new Date(end), new Date(start));
//   const done = differenceInCalendarDays(new Date(), new Date(start));
//   if (total <= 0) return 100;
//   return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
// }

// const TOOLTIP_STYLE = {
//   background: "hsl(var(--popover))",
//   border: "1px solid hsl(var(--border))",
//   borderRadius: 8,
//   fontSize: 12,
//   color: "hsl(var(--popover-foreground))",
// };

// export default function ManagerPerformance() {
//   const { user } = useAuth();
//   const { data: assignments = [] } = useAssignments();
//   const { data: employees = [] } = useEmployees();
//   const { data: updates = [] } = useDailyUpdates();
//   const { data: tickets = [] } = useTickets();
//   const { data: attendance = [] } = useAttendance();
//   const { data: projects = [] } = useProjects();

//   const scoped = useMemo(
//     () =>
//       user?.role === "Team Lead"
//         ? assignments.filter((a) => a.reporting_lead_id === user.id)
//         : assignments,
//     [assignments, user],
//   );

//   const teamIds = useMemo(
//     () => new Set(scoped.map((a) => a.employee_id)),
//     [scoped],
//   );

//   const teamMembers = useMemo(
//     () => employees.filter((e) => teamIds.has(e.id)),
//     [employees, teamIds],
//   );

//   // --- Metrics Engine ---
//   const calculateMetrics = useMemo(() => {
//     return (period: "all" | "week" | "month") => {
//       const now = new Date();
//       let interval: { start: Date; end: Date } | null = null;

//       if (period === "week") {
//         interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
//       } else if (period === "month") {
//         interval = { start: startOfMonth(now), end: endOfMonth(now) };
//       }

//       return teamMembers.map((emp) => {
//         // Delivery Metrics
//         const empAssign = scoped.filter((a) => a.employee_id === emp.id);
//         const expected = empAssign.length > 0
//           ? Math.round(empAssign.reduce((s, a) => s + elapsedPercent(a.start_date, a.end_date), 0) / empAssign.length)
//           : 0;
//         const actual = empAssign.length > 0
//           ? Math.round(empAssign.reduce((s, a) => s + a.completion_percentage, 0) / empAssign.length)
//           : 0;
//         const variance = actual - expected;

//         // Lagging Projects Details
//         const laggingProjects = empAssign.filter((a) => {
//           const e = elapsedPercent(a.start_date, a.end_date);
//           return (a.completion_percentage - e) <= -20;
//         }).map(a => projects.find(p => p.id === a.project_id)?.name || "Unknown Project");

//         // Active vs Completed Tasks
//         const completedAssigns = empAssign.filter(a => a.completion_percentage >= 100).length;
//         const activeAssigns = empAssign.length - completedAssigns;

//         // Engagement Metrics
//         const empUpdates = updates.filter((u) => {
//           if (u.employee_id !== emp.id) return false;
//           if (interval) return isWithinInterval(new Date(u.date), interval);
//           return true;
//         });
//         const blockers = empUpdates.filter((u) => u.has_blocker).length;
//         const updateCount = empUpdates.length;

//         // Throughput Metrics
//         const empTickets = tickets.filter((t) => {
//           if (t.assigned_to !== emp.id) return false;
//           if (interval) return isWithinInterval(new Date(t.updated_at || t.created_at), interval);
//           return true;
//         });
//         const ticketsResolved = empTickets.filter((t) => t.state === "Resolved" || t.state === "Closed").length;
//         const ticketsOpen = empTickets.filter((t) => !["Resolved", "Closed"].includes(t.state)).length;

//         // Score Calculation
//         const deliveryScore = Math.max(0, Math.min(100, 50 + (variance * 2)));
//         const totalTickets = ticketsResolved + ticketsOpen;
//         const ticketScore = totalTickets > 0 ? (ticketsResolved / totalTickets) * 100 : 100;
//         const expectedUpdates = period === "week" ? 5 : period === "month" ? 20 : 50;
//         const updateScore = Math.min(100, (updateCount / expectedUpdates) * 100);

//         let score = (deliveryScore * 0.6) + (ticketScore * 0.2) + (updateScore * 0.2);
//         score -= (blockers * 5);
//         score = Math.max(0, Math.min(100, Math.round(score)));

//         return {
//           id: emp.id,
//           name: emp.full_name.split(" ")[0],
//           full_name: emp.full_name,
//           role: emp.role,
//           expected,
//           actual,
//           variance,
//           blockers,
//           updateCount,
//           ticketsResolved,
//           ticketsOpen,
//           activeAssigns,
//           completedAssigns,
//           laggingProjects,
//           score,
//         };
//       });
//     };
//   }, [teamMembers, scoped, updates, tickets, attendance, projects]);

//   const allTimeMetrics = useMemo(() => calculateMetrics("all"), [calculateMetrics]);
//   const weeklyMetrics = useMemo(() => [...calculateMetrics("week")].sort((a, b) => b.score - a.score), [calculateMetrics]);
//   const monthlyMetrics = useMemo(() => [...calculateMetrics("month")].sort((a, b) => b.score - a.score), [calculateMetrics]);

//   // Overall KPIs
//   const kpis = useMemo(() => {
//     const onTrack = allTimeMetrics.filter((p) => p.variance >= 0).length;
//     const behind = allTimeMetrics.filter((p) => p.variance < 0 && p.variance > -20).length;
//     const lagging = allTimeMetrics.filter((p) => p.variance <= -20).length;
//     const avgScore = allTimeMetrics.length
//       ? Math.round(allTimeMetrics.reduce((s, p) => s + p.score, 0) / allTimeMetrics.length)
//       : 0;
//     const totalBlockers = allTimeMetrics.reduce((s, p) => s + p.blockers, 0);
//     const totalResolved = allTimeMetrics.reduce((s, p) => s + p.ticketsResolved, 0);
//     return { onTrack, behind, lagging, avgScore, totalBlockers, totalResolved };
//   }, [allTimeMetrics]);

//   // Velocity Chart
//   const velocity = useMemo(() => {
//     const days: { date: string; label: string; updates: number; blockers: number }[] = [];
//     for (let i = 13; i >= 0; i--) {
//       const d = subDays(new Date(), i);
//       const iso = d.toISOString().slice(0, 10);
//       const dayUpdates = updates.filter(
//         (u) => u.date === iso && (user?.role !== "Team Lead" || teamIds.has(u.employee_id)),
//       );
//       days.push({
//         date: iso,
//         label: format(d, "MMM d"),
//         updates: dayUpdates.length,
//         blockers: dayUpdates.filter((u) => u.has_blocker).length,
//       });
//     }
//     return days;
//   }, [updates, teamIds, user]);

//   // Project Level Health
//   const projectHealth = useMemo(() => {
//     const activeProjectIds = new Set(scoped.map(a => a.project_id));
//     return Array.from(activeProjectIds).map(pid => {
//       const pAssigns = scoped.filter(a => a.project_id === pid);
//       const proj = projects.find(p => p.id === pid);
      
//       const laggingCount = pAssigns.filter(a => {
//         const e = elapsedPercent(a.start_date, a.end_date);
//         return a.completion_percentage - e <= -20;
//       }).length;

//       const healthStatus = laggingCount > 0 ? "At Risk" : "On Track";
      
//       return {
//         id: pid,
//         name: proj?.name || "Unknown",
//         totalTeam: pAssigns.length,
//         laggingCount,
//         healthStatus,
//       };
//     }).sort((a, b) => b.laggingCount - a.laggingCount); // Show riskiest first
//   }, [scoped, projects]);

//   const healthDist = useMemo(() => {
//     return [
//       { name: "On track", value: kpis.onTrack, fill: "hsl(var(--success))" },
//       { name: "Behind", value: kpis.behind, fill: "hsl(var(--warning))" },
//       { name: "Lagging", value: kpis.lagging, fill: "hsl(var(--destructive))" },
//     ].filter((d) => d.value > 0);
//   }, [kpis]);

//   const workload = useMemo(() =>
//     allTimeMetrics.map((p) => {
//       const total = scoped
//         .filter((a) => a.employee_id === p.id)
//         .reduce((s, a) => s + (a.allocation_percentage ?? 0), 0);
//       return { name: p.name, allocation: Math.min(150, total) };
//     }),
//     [allTimeMetrics, scoped]
//   );

//   const colorFor = (variance: number) => {
//     if (variance >= 0) return "hsl(var(--success))";
//     if (variance >= -20) return "hsl(var(--warning))";
//     return "hsl(var(--destructive))";
//   };

//   const handleExportPDF = (period: string) => {
//     toast({
//       title: `Preparing ${period} Report...`,
//       description: "In the print dialog, select 'Save as PDF' as the destination.",
//     });
//     setTimeout(() => window.print(), 500);
//   };

//   return (
//     // Note the extensive print: utility classes added here to force light mode styles for the PDF
//     <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0 print:bg-white print:text-black print:p-8 print:w-full print:m-0">
      
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:mb-6">
//         <div>
//           <h1 className="text-xl font-semibold sm:text-2xl print:text-3xl print:text-black">Performance & Analytics Report</h1>
//           <p className="text-sm text-muted-foreground print:text-gray-600">
//             Exported on {format(new Date(), "MMMM do, yyyy")}
//           </p>
//         </div>
//         <div className="flex gap-2 shrink-0 print:hidden">
//           <Button variant="outline" className="gap-2 text-xs sm:text-sm" onClick={() => handleExportPDF("Weekly")}>
//             <Download className="w-4 h-4" /> Weekly PDF
//           </Button>
//           <Button variant="outline" className="gap-2 text-xs sm:text-sm" onClick={() => handleExportPDF("Monthly")}>
//             <Download className="w-4 h-4" /> Monthly PDF
//           </Button>
//         </div>
//       </div>

//       {/* --- KPIs --- */}
//       <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 print:grid-cols-3 print:gap-4 print:break-inside-avoid">
//         <KpiCard label="Avg Score" value={`${kpis.avgScore}`} icon={Gauge} variant="primary" hint="0–100" />
//         <KpiCard label="On Track" value={kpis.onTrack} icon={TrendingUp} variant="success" />
//         <KpiCard label="Behind" value={kpis.behind} icon={Clock} variant="warning" />
//         <KpiCard label="Lagging" value={kpis.lagging} icon={TrendingDown} variant="destructive" />
//         <KpiCard label="Tickets Resolved" value={kpis.totalResolved} icon={CheckCircle2} variant="info" />
//         <KpiCard label="Blockers" value={kpis.totalBlockers} icon={Activity} variant="warning" />
//       </div>

//       {/* --- EXPECTED VS ACTUAL --- */}
//       <Card className="shadow-sm print:shadow-none print:border-gray-200 print:break-inside-avoid">
//         <CardHeader className="pb-2 print:bg-gray-50 print:border-b print:border-gray-200">
//           <h2 className="text-base font-semibold print:text-black">Expected vs Actual Progress</h2>
//         </CardHeader>
//         <CardContent className="h-[320px] sm:h-[400px] pt-4">
//           {allTimeMetrics.length === 0 ? (
//             <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet.</div>
//           ) : (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={allTimeMetrics} margin={{ top: 16, right: 0, bottom: 8, left: -20 }}>
//                 <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
//                 <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
//                 <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
//                 <Tooltip contentStyle={TOOLTIP_STYLE} />
//                 <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
//                 <Bar dataKey="expected" name="Expected %" fill="#9ca3af" radius={[4, 4, 0, 0]} maxBarSize={40} />
//                 <Bar dataKey="actual" name="Actual %" radius={[4, 4, 0, 0]} maxBarSize={40}>
//                   {allTimeMetrics.map((d, i) => (
//                     <Cell key={i} fill={colorFor(d.variance)} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </CardContent>
//       </Card>

//       {/* --- ACTIVE VS COMPLETED ASSIGNMENTS --- */}
//       <Card className="shadow-sm print:shadow-none print:border-gray-200 print:break-inside-avoid">
//         <CardHeader className="pb-2 print:bg-gray-50 print:border-b print:border-gray-200">
//           <h2 className="text-base font-semibold print:text-black">Active vs Completed Assignments</h2>
//           <p className="text-xs text-muted-foreground print:text-gray-600">Total volume of tasks assigned per team member.</p>
//         </CardHeader>
//         <CardContent className="h-[280px] sm:h-[320px] pt-4">
//           {allTimeMetrics.length === 0 ? (
//             <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet.</div>
//           ) : (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={allTimeMetrics} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
//                 <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} />
//                 <XAxis type="number" stroke="#6b7280" fontSize={11} allowDecimals={false} />
//                 <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={80} />
//                 <Tooltip contentStyle={TOOLTIP_STYLE} />
//                 <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
//                 <Bar dataKey="completedAssigns" name="Completed" stackId="a" fill="hsl(var(--success))" maxBarSize={30} />
//                 <Bar dataKey="activeAssigns" name="Active (Pending)" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={30} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </CardContent>
//       </Card>

//       <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
        
//         {/* --- LEADERBOARDS --- */}
//         <Card className="shadow-sm lg:col-span-2 print:col-span-2 print:shadow-none print:border-gray-200">
//           <CardHeader className="pb-0 border-b bg-muted/10 print:bg-gray-50 print:border-gray-200">
//             <h2 className="flex items-center gap-2 text-base font-semibold mb-2 print:text-black">
//               <Award className="h-4 w-4 text-primary print:text-gray-800" /> Performance Leaderboards
//             </h2>
//           </CardHeader>
//           <CardContent className="p-0">
//             {/* The tabs component isn't great for printing since only one shows. So in print, we force both lists to render sequentially, but on web we keep tabs. */}
//             <div className="print:hidden">
//               <Tabs defaultValue="weekly" className="w-full">
//                 <div className="px-4 pt-3 pb-1">
//                   <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-grid">
//                     <TabsTrigger value="weekly">Weekly</TabsTrigger>
//                     <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   </TabsList>
//                 </div>
//                 <TabsContent value="weekly" className="m-0 p-4"><LeaderboardList metrics={weeklyMetrics} /></TabsContent>
//                 <TabsContent value="monthly" className="m-0 p-4"><LeaderboardList metrics={monthlyMetrics} /></TabsContent>
//               </Tabs>
//             </div>
            
//             {/* Print Only Version of Leaderboards */}
//             <div className="hidden print:grid grid-cols-2 gap-6 p-4">
//               <div>
//                 <h3 className="font-semibold text-sm mb-3 border-b pb-1 text-black">Weekly Top Performers</h3>
//                 <LeaderboardList metrics={weeklyMetrics} />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-sm mb-3 border-b pb-1 text-black">Monthly Top Performers</h3>
//                 <LeaderboardList metrics={monthlyMetrics} />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* --- PROJECT HEALTH SUMMARY --- */}
//         <Card className="shadow-sm h-fit print:shadow-none print:border-gray-200">
//           <CardHeader className="pb-2 border-b bg-muted/10 print:bg-gray-50 print:border-gray-200">
//             <h2 className="text-base font-semibold print:text-black">Project Risk Status</h2>
//             <p className="text-xs text-muted-foreground print:text-gray-600">Identifying bottlenecks at the project level.</p>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="divide-y print:divide-gray-200">
//               {projectHealth.length === 0 ? (
//                 <div className="p-6 text-center text-sm text-muted-foreground print:text-gray-600">No active projects.</div>
//               ) : (
//                 projectHealth.slice(0, 6).map(ph => (
//                   <div key={ph.id} className="p-3 sm:p-4 flex items-center justify-between gap-3">
//                     <div className="min-w-0">
//                       <div className="font-medium text-sm truncate print:text-black">{ph.name}</div>
//                       <div className="text-xs text-muted-foreground print:text-gray-600">{ph.totalTeam} assignments</div>
//                     </div>
//                     <div className="shrink-0 text-right">
//                       {ph.laggingCount > 0 ? (
//                         <StatusBadge label={`${ph.laggingCount} lagging`} variant="destructive" />
//                       ) : (
//                         <StatusBadge label="Healthy" variant="success" />
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* --- DETAILED SCORECARDS --- */}
//       <Card className="shadow-sm print:shadow-none print:border-none print:break-before-page">
//         <CardHeader className="pb-2 bg-muted/10 border-b print:bg-transparent print:border-b-2 print:border-black print:px-0">
//           <h2 className="text-lg font-bold print:text-black">Detailed Individual Scorecards</h2>
//           <p className="text-sm text-muted-foreground print:text-gray-600">Complete drill-down of all team members.</p>
//         </CardHeader>
//         <CardContent className="space-y-6 pt-6 print:px-0">
//           {allTimeMetrics.length === 0 && (
//             <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl mx-1 print:border-gray-300">
//               No team members assigned yet.
//             </div>
//           )}
//           {allTimeMetrics.map((p) => {
//             const status = p.variance >= 0
//               ? { label: "On track", v: "success" as const }
//               : p.variance > -20
//                 ? { label: `${Math.abs(p.variance)}% behind`, v: "warning" as const }
//                 : { label: `Lagging ${Math.abs(p.variance)}%`, v: "destructive" as const };
                
//             return (
//               <div key={p.id} className="rounded-lg border bg-card/40 p-4 print:border-gray-300 print:bg-white print:break-inside-avoid shadow-sm">
//                 <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//                   <div className="min-w-0">
//                     <div className="truncate text-base font-semibold print:text-black">{p.full_name}</div>
//                     <div className="text-sm text-muted-foreground print:text-gray-600">{p.role}</div>
                    
//                     {/* Explicitly show which projects they are lagging on to make it actionable */}
//                     {p.laggingProjects.length > 0 && (
//                       <div className="mt-2 flex items-start gap-1.5 text-xs">
//                         <span className="text-destructive font-semibold print:text-red-700 mt-0.5">Alert:</span>
//                         <span className="text-muted-foreground print:text-gray-700">Lagging behind on {p.laggingProjects.join(", ")}</span>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="flex flex-wrap items-center gap-2 self-start">
//                     <StatusBadge label={status.label} variant={status.v} />
//                     <div className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-sm font-semibold print:bg-gray-100 print:text-black print:border-gray-300">
//                       Score: {p.score}
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="grid gap-3 text-xs grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
//                   <Stat label="Expected" value={`${p.expected}%`} />
//                   <Stat label="Actual" value={`${p.actual}%`} />
//                   <Stat label="Active Tasks" value={p.activeAssigns} />
//                   <Stat label="Completed" value={p.completedAssigns} />
//                   <Stat label="Tickets Fixed" value={p.ticketsResolved} />
//                   <Stat label="Blockers" value={p.blockers} accent={p.blockers > 0 ? "warning" : undefined} />
//                 </div>
//               </div>
//             );
//           })}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // --- Helper Components ---

// function LeaderboardList({ metrics }: { metrics: any[] }) {
//   const topPerformers = metrics.slice(0, 5);

//   if (topPerformers.length === 0) {
//     return <div className="text-sm text-muted-foreground p-8 text-center print:text-gray-600">No active data for this period.</div>;
//   }

//   return (
//     <div className="space-y-3">
//       {topPerformers.map((p, i) => (
//         <div key={p.id} className="flex items-center gap-3 py-1 print:border-b print:border-gray-100 print:pb-2 print:mb-2">
//           <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold print:border print:border-gray-300 print:text-black ${
//             i === 0 ? "bg-yellow-500 text-white print:bg-white" : 
//             i === 1 ? "bg-gray-400 text-white print:bg-white" : 
//             i === 2 ? "bg-amber-700 text-white print:bg-white" : 
//             "bg-muted text-muted-foreground print:bg-white"
//           }`}>
//             #{i + 1}
//           </div>
//           <div className="min-w-0 flex-1">
//             <div className="flex items-center justify-between gap-2">
//               <span className="truncate text-sm font-medium print:text-black">{p.full_name}</span>
//               <span className="shrink-0 text-sm font-bold text-primary print:text-black">{p.score}</span>
//             </div>
//             {/* Visual bar hidden on print to save ink, rely on the number */}
//             <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted/60 dark:bg-muted print:hidden">
//               <div
//                 className={`h-full rounded-full transition-all ${i === 0 ? 'bg-yellow-500' : 'bg-primary'}`}
//                 style={{ width: `${p.score}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "warning" | "destructive" }) {
//   return (
//     <div className="rounded-md border bg-background/60 p-3 shadow-sm print:border-gray-300 print:bg-white print:shadow-none">
//       <div className="text-[10px] uppercase tracking-wider text-muted-foreground print:text-gray-500">{label}</div>
//       <div className={`mt-1 text-base font-semibold print:text-black ${
//         accent === "warning" ? "text-warning" : accent === "destructive" ? "text-destructive" : "text-foreground"
//       }`}>
//         {value}
//       </div>
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAssignments,
  useAttendance,
  useDailyUpdates,
  useEmployees,
  useProjects,
  useTickets,
} from "@/hooks/useStaffArcData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  Gauge,
  LayoutList,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  differenceInCalendarDays,
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Utility Functions ---
function elapsedPercent(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const total = differenceInCalendarDays(new Date(end), new Date(start));
  const done = differenceInCalendarDays(new Date(), new Date(start));
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

export default function ManagerPerformance() {
  const { user } = useAuth();
  const { data: assignments = [] } = useAssignments();
  const { data: employees = [] } = useEmployees();
  const { data: updates = [] } = useDailyUpdates();
  const { data: tickets = [] } = useTickets();
  const { data: attendance = [] } = useAttendance();
  const { data: projects = [] } = useProjects();

  // Filter State
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  const scoped = useMemo(
    () =>
      user?.role === "Team Lead"
        ? assignments.filter((a) => a.reporting_lead_id === user.id)
        : assignments,
    [assignments, user],
  );

  const teamIds = useMemo(
    () => new Set(scoped.map((a) => a.employee_id)),
    [scoped],
  );

  const teamMembers = useMemo(() => {
    const members = employees.filter((e) => teamIds.has(e.id));
    if (selectedEmployee !== "all") {
      return members.filter(m => m.id === selectedEmployee);
    }
    return members;
  }, [employees, teamIds, selectedEmployee]);

  // --- Metrics Engine ---
  const calculateMetrics = useMemo(() => {
    return (period: "all" | "week" | "month") => {
      const now = new Date();
      let interval: { start: Date; end: Date } | null = null;

      if (period === "week") {
        interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      } else if (period === "month") {
        interval = { start: startOfMonth(now), end: endOfMonth(now) };
      }

      return teamMembers.map((emp) => {
        // Delivery Metrics
        const empAssign = scoped.filter((a) => a.employee_id === emp.id);
        const expected = empAssign.length > 0
          ? Math.round(empAssign.reduce((s, a) => s + elapsedPercent(a.start_date, a.end_date), 0) / empAssign.length)
          : 0;
        const actual = empAssign.length > 0
          ? Math.round(empAssign.reduce((s, a) => s + a.completion_percentage, 0) / empAssign.length)
          : 0;
        const variance = actual - expected;

        // Lagging Projects Details
        const laggingProjects = empAssign.filter((a) => {
          const e = elapsedPercent(a.start_date, a.end_date);
          return (a.completion_percentage - e) <= -20;
        }).map(a => projects.find(p => p.id === a.project_id)?.name || "Unknown Project");

        // Active vs Completed Tasks
        const completedAssigns = empAssign.filter(a => a.completion_percentage >= 100).length;
        const activeAssigns = empAssign.length - completedAssigns;

        // Engagement Metrics
        const empUpdates = updates.filter((u) => {
          if (u.employee_id !== emp.id) return false;
          if (interval) return isWithinInterval(new Date(u.date), interval);
          return true;
        });
        const blockers = empUpdates.filter((u) => u.has_blocker).length;
        const updateCount = empUpdates.length;

        // Throughput Metrics
        const empTickets = tickets.filter((t) => {
          if (t.assigned_to !== emp.id) return false;
          if (interval) return isWithinInterval(new Date(t.updated_at || t.created_at), interval);
          return true;
        });
        const ticketsResolved = empTickets.filter((t) => t.state === "Resolved" || t.state === "Closed").length;
        const ticketsOpen = empTickets.filter((t) => !["Resolved", "Closed"].includes(t.state)).length;

        // Score Calculation
        const deliveryScore = Math.max(0, Math.min(100, 50 + (variance * 2)));
        const totalTickets = ticketsResolved + ticketsOpen;
        const ticketScore = totalTickets > 0 ? (ticketsResolved / totalTickets) * 100 : 100;
        const expectedUpdates = period === "week" ? 5 : period === "month" ? 20 : 50;
        const updateScore = Math.min(100, (updateCount / expectedUpdates) * 100);

        let score = (deliveryScore * 0.6) + (ticketScore * 0.2) + (updateScore * 0.2);
        score -= (blockers * 5);
        score = Math.max(0, Math.min(100, Math.round(score)));

        return {
          id: emp.id,
          name: emp.full_name.split(" ")[0],
          full_name: emp.full_name,
          role: emp.role,
          expected,
          actual,
          variance,
          blockers,
          updateCount,
          ticketsResolved,
          ticketsOpen,
          activeAssigns,
          completedAssigns,
          laggingProjects,
          score,
        };
      });
    };
  }, [teamMembers, scoped, updates, tickets, attendance, projects]);

  const allTimeMetrics = useMemo(() => calculateMetrics("all"), [calculateMetrics]);
  const weeklyMetrics = useMemo(() => [...calculateMetrics("week")].sort((a, b) => b.score - a.score), [calculateMetrics]);
  const monthlyMetrics = useMemo(() => [...calculateMetrics("month")].sort((a, b) => b.score - a.score), [calculateMetrics]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const onTrack = allTimeMetrics.filter((p) => p.variance >= 0).length;
    const behind = allTimeMetrics.filter((p) => p.variance < 0 && p.variance > -20).length;
    const lagging = allTimeMetrics.filter((p) => p.variance <= -20).length;
    const avgScore = allTimeMetrics.length
      ? Math.round(allTimeMetrics.reduce((s, p) => s + p.score, 0) / allTimeMetrics.length)
      : 0;
    const totalBlockers = allTimeMetrics.reduce((s, p) => s + p.blockers, 0);
    const totalResolved = allTimeMetrics.reduce((s, p) => s + p.ticketsResolved, 0);
    const activeTasks = allTimeMetrics.reduce((s, p) => s + p.activeAssigns, 0);
    const completedTasks = allTimeMetrics.reduce((s, p) => s + p.completedAssigns, 0);

    return { onTrack, behind, lagging, avgScore, totalBlockers, totalResolved, activeTasks, completedTasks };
  }, [allTimeMetrics]);

  // Velocity Line Chart Data (14-day history)
  const velocity = useMemo(() => {
    const days: { date: string; label: string; updates: number; blockers: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const iso = d.toISOString().slice(0, 10);
      const dayUpdates = updates.filter(
        (u) => u.date === iso && teamMembers.some(tm => tm.id === u.employee_id)
      );
      days.push({
        date: iso,
        label: format(d, "MMM d"),
        updates: dayUpdates.length,
        blockers: dayUpdates.filter((u) => u.has_blocker).length,
      });
    }
    return days;
  }, [updates, teamMembers]);

  // Health Pie Chart Data
  const healthDist = useMemo(() => {
    return [
      { name: "On track", value: kpis.onTrack, fill: "hsl(var(--success))" },
      { name: "Behind", value: kpis.behind, fill: "hsl(var(--warning))" },
      { name: "Lagging", value: kpis.lagging, fill: "hsl(var(--destructive))" },
    ].filter((d) => d.value > 0);
  }, [kpis]);

  // Project Level Health
  const projectHealth = useMemo(() => {
    const activeProjectIds = new Set(scoped.map(a => a.project_id));
    return Array.from(activeProjectIds).map(pid => {
      // Filter project assignments to only include currently filtered team members
      const pAssigns = scoped.filter(a => a.project_id === pid && teamMembers.some(tm => tm.id === a.employee_id));
      if (pAssigns.length === 0) return null; // Skip projects not assigned to the filtered user(s)

      const proj = projects.find(p => p.id === pid);
      const laggingCount = pAssigns.filter(a => {
        const e = elapsedPercent(a.start_date, a.end_date);
        return a.completion_percentage - e <= -20;
      }).length;

      const healthStatus = laggingCount > 0 ? "At Risk" : "On Track";
      
      return {
        id: pid,
        name: proj?.name || "Unknown",
        totalTeam: pAssigns.length,
        laggingCount,
        healthStatus,
      };
    }).filter(Boolean).sort((a: any, b: any) => b.laggingCount - a.laggingCount); // Show riskiest first
  }, [scoped, projects, teamMembers]);

  const colorFor = (variance: number) => {
    if (variance >= 0) return "hsl(var(--success))";
    if (variance >= -20) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const handleExportPDF = () => {
    // Explicitly trigger print, letting native browser print handle PDF save.
    setTimeout(() => window.print(), 100);
  };

  return (
    // Note the extensive print: utility classes added here to force light mode styles for the PDF
    <div className="space-y-6 max-w-full overflow-hidden px-1 sm:px-0 print:bg-white print:text-black print:p-8 print:w-full print:m-0">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:mb-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl print:text-3xl print:text-black">
            {selectedEmployee === "all" ? "Team Performance & Analytics" : "Individual Performance Report"}
          </h1>
          <p className="text-sm text-muted-foreground print:text-gray-600">
            Exported on {format(new Date(), "MMMM do, yyyy")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0 print:hidden w-full lg:w-auto">
          {/* Employee Filter */}
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              {employees.filter(e => teamIds.has(e.id)).map(e => (
                <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Download Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4" /> Weekly Report
            </Button>
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4" /> Monthly Report
            </Button>
          </div>
        </div>
      </div>

      {/* --- KPIs (Fixed Layout to Prevent Text Wrapping) --- */}
      {/* Changed xl:grid-cols-8 to lg:grid-cols-4 so text has room to breathe */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 print:grid-cols-4 print:gap-4 print:break-inside-avoid">
        {selectedEmployee === "all" && (
          <KpiCard label="Team Size" value={teamMembers.length} icon={Users} variant="info" />
        )}
        <KpiCard label="Avg Score" value={`${kpis.avgScore}`} icon={Gauge} variant="primary" hint="0–100" />
        <KpiCard label="On Track Tasks" value={kpis.onTrack} icon={TrendingUp} variant="success" />
        <KpiCard label="Lagging Tasks" value={kpis.lagging} icon={TrendingDown} variant="destructive" />
        <KpiCard label="Active Tasks" value={kpis.activeTasks} icon={LayoutList} variant="warning" />
        <KpiCard label="Completed" value={kpis.completedTasks} icon={Briefcase} variant="success" />
        <KpiCard label="Tickets Fixed" value={kpis.totalResolved} icon={CheckCircle2} variant="info" />
        <KpiCard label="Blockers" value={kpis.totalBlockers} icon={Activity} variant="destructive" />
      </div>

      {/* --- NEW CHARTS ROW: PIE & VELOCITY --- */}
      <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
        {/* --- HEALTH PIE CHART --- */}
        <Card className="shadow-sm print:shadow-none print:border-gray-200">
          <CardHeader className="pb-2 print:bg-gray-50 print:border-b print:border-gray-200">
            <h2 className="text-base font-semibold print:text-black">Task Health Distribution</h2>
          </CardHeader>
          <CardContent className="h-[240px] pt-4">
            {healthDist.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {healthDist.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* --- VELOCITY LINE CHART --- */}
        <Card className="shadow-sm lg:col-span-2 print:shadow-none print:border-gray-200">
          <CardHeader className="pb-2 print:bg-gray-50 print:border-b print:border-gray-200">
            <h2 className="text-base font-semibold print:text-black">Velocity (Updates vs Blockers)</h2>
            <p className="text-xs text-muted-foreground">Last 14 days of engagement.</p>
          </CardHeader>
          <CardContent className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocity} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="updates" name="Daily Updates" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="blockers" name="Blockers" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- EXPECTED VS ACTUAL --- */}
      <Card className="shadow-sm print:shadow-none print:border-gray-200 print:break-inside-avoid">
        <CardHeader className="pb-2 print:bg-gray-50 print:border-b print:border-gray-200">
          <h2 className="text-base font-semibold print:text-black">Expected vs Actual Progress</h2>
        </CardHeader>
        <CardContent className="h-[320px] sm:h-[400px] pt-4">
          {allTimeMetrics.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allTimeMetrics} margin={{ top: 16, right: 0, bottom: 8, left: -20 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="expected" name="Expected %" fill="#9ca3af" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="actual" name="Actual %" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {allTimeMetrics.map((d, i) => (
                    <Cell key={i} fill={colorFor(d.variance)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* --- ACTIVE VS COMPLETED ASSIGNMENTS --- */}
      <Card className="shadow-sm print:shadow-none print:border-gray-200 print:break-inside-avoid">
        <CardHeader className="pb-2 print:bg-gray-50 print:border-b print:border-gray-200">
          <h2 className="text-base font-semibold print:text-black">Active vs Completed Assignments</h2>
          <p className="text-xs text-muted-foreground print:text-gray-600">Total volume of tasks assigned.</p>
        </CardHeader>
        <CardContent className="h-[280px] sm:h-[320px] pt-4">
          {allTimeMetrics.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allTimeMetrics} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={11} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="completedAssigns" name="Completed Tasks" stackId="a" fill="hsl(var(--success))" maxBarSize={30} />
                <Bar dataKey="activeAssigns" name="Active (Pending)" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
        
        {/* --- LEADERBOARDS --- */}
        {selectedEmployee === "all" ? (
          <Card className="shadow-sm lg:col-span-2 print:col-span-2 print:shadow-none print:border-gray-200">
            <CardHeader className="pb-0 border-b bg-muted/10 print:bg-gray-50 print:border-gray-200">
              <h2 className="flex items-center gap-2 text-base font-semibold mb-2 print:text-black">
                <Award className="h-4 w-4 text-primary print:text-gray-800" /> Performance Leaderboards
              </h2>
            </CardHeader>
            <CardContent className="p-0">
              <div className="print:hidden">
                <Tabs defaultValue="weekly" className="w-full">
                  <div className="px-4 pt-3 pb-1">
                    <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-grid">
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="weekly" className="m-0 p-4"><LeaderboardList metrics={weeklyMetrics} /></TabsContent>
                  <TabsContent value="monthly" className="m-0 p-4"><LeaderboardList metrics={monthlyMetrics} /></TabsContent>
                </Tabs>
              </div>
              
              {/* Print Only Version of Leaderboards */}
              <div className="hidden print:grid grid-cols-2 gap-6 p-4">
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b pb-1 text-black">Weekly Top Performers</h3>
                  <LeaderboardList metrics={weeklyMetrics} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-3 border-b pb-1 text-black">Monthly Top Performers</h3>
                  <LeaderboardList metrics={monthlyMetrics} />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm lg:col-span-2 print:col-span-2 print:shadow-none print:border-gray-200 flex flex-col items-center justify-center p-8 bg-muted/10 print:bg-gray-50">
            <Award className="h-12 w-12 text-primary/40 mb-3" />
            <h3 className="font-semibold text-lg">Individual View Active</h3>
            <p className="text-sm text-muted-foreground">Clear filter to view team leaderboards.</p>
          </Card>
        )}

        {/* --- PROJECT HEALTH SUMMARY --- */}
        <Card className="shadow-sm h-fit print:shadow-none print:border-gray-200">
          <CardHeader className="pb-2 border-b bg-muted/10 print:bg-gray-50 print:border-gray-200">
            <h2 className="text-base font-semibold print:text-black">Project Risk Status</h2>
            <p className="text-xs text-muted-foreground print:text-gray-600">Bottlenecks for filtered resources.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y print:divide-gray-200">
              {projectHealth.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground print:text-gray-600">No active projects.</div>
              ) : (
                projectHealth.slice(0, 6).map((ph: any) => (
                  <div key={ph.id} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate print:text-black">{ph.name}</div>
                      <div className="text-xs text-muted-foreground print:text-gray-600">{ph.totalTeam} assignments</div>
                    </div>
                    <div className="shrink-0 text-right">
                      {ph.laggingCount > 0 ? (
                        <StatusBadge label={`${ph.laggingCount} lagging`} variant="destructive" />
                      ) : (
                        <StatusBadge label="Healthy" variant="success" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- DETAILED SCORECARDS --- */}
      <Card className="shadow-sm print:shadow-none print:border-none print:break-before-page">
        <CardHeader className="pb-2 bg-muted/10 border-b print:bg-transparent print:border-b-2 print:border-black print:px-0">
          <h2 className="text-lg font-bold print:text-black">Detailed Individual Scorecards</h2>
          <p className="text-sm text-muted-foreground print:text-gray-600">Complete drill-down of metrics.</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 print:px-0">
          {allTimeMetrics.length === 0 && (
            <div className="text-sm text-muted-foreground p-8 text-center border-2 border-dashed rounded-xl mx-1 print:border-gray-300">
              No team members assigned yet.
            </div>
          )}
          {allTimeMetrics.map((p) => {
            const status = p.variance >= 0
              ? { label: "On track", v: "success" as const }
              : p.variance > -20
                ? { label: `${Math.abs(p.variance)}% behind`, v: "warning" as const }
                : { label: `Lagging ${Math.abs(p.variance)}%`, v: "destructive" as const };
                
            return (
              <div key={p.id} className="rounded-lg border bg-card/40 p-4 print:border-gray-300 print:bg-white print:break-inside-avoid shadow-sm">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold print:text-black">{p.full_name}</div>
                    <div className="text-sm text-muted-foreground print:text-gray-600">{p.role}</div>
                    
                    {/* Explicitly show which projects they are lagging on to make it actionable */}
                    {p.laggingProjects.length > 0 && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs">
                        <span className="text-destructive font-semibold print:text-red-700 mt-0.5">Alert:</span>
                        <span className="text-muted-foreground print:text-gray-700 leading-tight">Lagging behind on {p.laggingProjects.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <StatusBadge label={status.label} variant={status.v} />
                    <div className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-sm font-semibold print:bg-gray-100 print:text-black print:border-gray-300">
                      Score: {p.score}
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-3 text-xs grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
                  <Stat label="Expected" value={`${p.expected}%`} />
                  <Stat label="Actual" value={`${p.actual}%`} />
                  <Stat label="Active Tasks" value={p.activeAssigns} />
                  <Stat label="Completed" value={p.completedAssigns} />
                  <Stat label="Tickets Fixed" value={p.ticketsResolved} />
                  <Stat label="Blockers" value={p.blockers} accent={p.blockers > 0 ? "warning" : undefined} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Components ---

function LeaderboardList({ metrics }: { metrics: any[] }) {
  const topPerformers = metrics.slice(0, 5);

  if (topPerformers.length === 0) {
    return <div className="text-sm text-muted-foreground p-8 text-center print:text-gray-600">No active data for this period.</div>;
  }

  return (
    <div className="space-y-3">
      {topPerformers.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3 py-1 print:border-b print:border-gray-100 print:pb-2 print:mb-2">
          <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold print:border print:border-gray-300 print:text-black ${
            i === 0 ? "bg-yellow-500 text-white print:bg-white" : 
            i === 1 ? "bg-gray-400 text-white print:bg-white" : 
            i === 2 ? "bg-amber-700 text-white print:bg-white" : 
            "bg-muted text-muted-foreground print:bg-white"
          }`}>
            #{i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium print:text-black">{p.full_name}</span>
              <span className="shrink-0 text-sm font-bold text-primary print:text-black">{p.score}</span>
            </div>
            {/* Visual bar hidden on print to save ink, rely on the number */}
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted/60 dark:bg-muted print:hidden">
              <div
                className={`h-full rounded-full transition-all ${i === 0 ? 'bg-yellow-500' : 'bg-primary'}`}
                style={{ width: `${p.score}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "warning" | "destructive" }) {
  return (
    <div className="rounded-md border bg-background/60 p-3 shadow-sm print:border-gray-300 print:bg-white print:shadow-none">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground print:text-gray-500">{label}</div>
      <div className={`mt-1 text-base font-semibold print:text-black ${
        accent === "warning" ? "text-warning" : accent === "destructive" ? "text-destructive" : "text-foreground"
      }`}>
        {value}
      </div>
    </div>
  );
}