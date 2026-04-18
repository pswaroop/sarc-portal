// import { useMemo } from "react";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/contexts/AuthContext";
// import { useAttendance, useCheckIn } from "@/hooks/useStaffArcData";
// import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
// import type { AttendanceStatus } from "@/types";
// import { format, isSameMonth } from "date-fns";
// import { toast } from "@/hooks/use-toast";

// const ACTIONS: { label: string; value: AttendanceStatus }[] = [
//   { label: "Present (Office)", value: "Present" },
//   { label: "Work From Home", value: "WFH" },
//   { label: "Leave", value: "Leave" },
// ];

// export default function EmployeeAttendance() {
//   const { user } = useAuth();
//   const { data: attendance = [] } = useAttendance();
//   const checkIn = useCheckIn();

//   const mine = useMemo(() => attendance.filter((a) => a.employee_id === user?.id), [attendance, user]);
//   const today = format(new Date(), "yyyy-MM-dd");
//   const todayEntry = mine.find((a) => a.date === today);

//   const monthly = useMemo(() => {
//     const now = new Date();
//     const inMonth = mine.filter((a) => isSameMonth(new Date(a.date), now));
//     const counts: Record<AttendanceStatus, number> = { Present: 0, WFH: 0, Leave: 0, Absent: 0, "Half-Day": 0 };
//     inMonth.forEach((a) => { counts[a.status] += 1; });
//     return { total: inMonth.length, counts };
//   }, [mine]);

//   const handleCheck = (status: AttendanceStatus) => {
//     if (!user) return;
//     checkIn.mutate({ employee_id: user.id, date: today, status });
//     toast({ title: `Checked in as ${status}` });
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold">Attendance</h1>
//         <p className="text-sm text-muted-foreground">Daily check-in and monthly summary.</p>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         <Card className="lg:col-span-1">
//           <CardHeader className="pb-2">
//             <h2 className="text-base font-semibold">Today's check-in</h2>
//             <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d, yyyy")}</p>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {todayEntry && (
//               <div className="rounded-lg border bg-muted/30 p-3 text-sm">
//                 Marked as <StatusBadge label={todayEntry.status} variant={statusToVariant(todayEntry.status)} />
//               </div>
//             )}
//             <div className="grid gap-2">
//               {ACTIONS.map((a) => (
//                 <Button
//                   key={a.value}
//                   variant={todayEntry?.status === a.value ? "default" : "outline"}
//                   className={todayEntry?.status === a.value ? "bg-gradient-brand text-primary-foreground" : ""}
//                   onClick={() => handleCheck(a.value)}
//                 >
//                   {a.label}
//                 </Button>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="lg:col-span-2">
//           <CardHeader className="pb-2">
//             <h2 className="text-base font-semibold">This month</h2>
//             <p className="text-xs text-muted-foreground">{format(new Date(), "MMMM yyyy")} · {monthly.total} entries</p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
//               {(["Present", "WFH", "Half-Day", "Leave", "Absent"] as AttendanceStatus[]).map((s) => (
//                 <div key={s} className="rounded-lg border bg-card/40 p-3 text-center">
//                   <div className="text-2xl font-semibold">{monthly.counts[s]}</div>
//                   <div className="mt-1"><StatusBadge label={s} variant={statusToVariant(s)} /></div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6">
//               <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent</h3>
//               <ul className="divide-y">
//                 {mine.slice(0, 8).map((a) => (
//                   <li key={a.id} className="flex items-center justify-between py-2 text-sm">
//                     <span>{format(new Date(a.date), "EEE, MMM d")}</span>
//                     <StatusBadge label={a.status} variant={statusToVariant(a.status)} />
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance, useCheckIn } from "@/hooks/useStaffArcData";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import type { AttendanceStatus } from "@/types";
import { format, isSameMonth } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Clock, MapPin, Home, CalendarOff } from "lucide-react";

const ACTIONS: {
  label: string;
  value: AttendanceStatus;
  icon: any;
  color: string;
}[] = [
  {
    label: "Present (Office)",
    value: "Present",
    icon: MapPin,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    label: "Work From Home",
    value: "WFH",
    icon: Home,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    label: "On Leave",
    value: "Leave",
    icon: CalendarOff,
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const { data: attendance = [] } = useAttendance();
  const checkIn = useCheckIn();

  const mine = useMemo(
    () => attendance.filter((a) => a.employee_id === user?.id),
    [attendance, user],
  );
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = mine.find((a) => a.date === today);

  const monthly = useMemo(() => {
    const now = new Date();
    const inMonth = mine.filter((a) => isSameMonth(new Date(a.date), now));
    const counts: Record<AttendanceStatus, number> = {
      Present: 0,
      WFH: 0,
      Leave: 0,
      Absent: 0,
    };
    inMonth.forEach((a) => {
      counts[a.status] += 1;
    });
    return { total: inMonth.length, counts };
  }, [mine]);

  const handleCheck = (status: AttendanceStatus) => {
    if (!user) return;
    checkIn.mutate({ employee_id: user.id, date: today, status });
    toast({ title: `Successfully checked in as ${status}` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance & Leave</h1>
        <p className="text-sm text-muted-foreground">
          Mark your daily presence and track your monthly statistics.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Check-in Card */}
        <Card className="lg:col-span-1 shadow-md border-primary/20">
          <CardHeader className="pb-4 bg-muted/20 border-b">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" /> Today's Check-in
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </p>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {todayEntry ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  You are currently marked as
                </p>
                <div className="inline-block scale-110">
                  <StatusBadge
                    label={todayEntry.status}
                    variant={statusToVariant(todayEntry.status)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  You can change your status below if needed.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You haven't checked in yet today.
                </p>
              </div>
            )}

            <div className="grid gap-3 pt-2">
              {ACTIONS.map((a) => {
                const Icon = a.icon;
                const isSelected = todayEntry?.status === a.value;
                return (
                  <Button
                    key={a.value}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-12 flex justify-start px-4 ${isSelected ? a.color : ""}`}
                    onClick={() => handleCheck(a.value)}
                  >
                    <Icon className="w-4 h-4 mr-3 opacity-70" />
                    {a.label}
                    {isSelected && (
                      <span className="ml-auto text-xs bg-black/20 px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Monthly Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "MMMM yyyy")} · {monthly.total} total days
              logged
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-2">
              {(
                ["Present", "WFH", "Leave"] as AttendanceStatus[]
              ).map((s) => (
                <div
                  key={s}
                  className="rounded-xl border bg-card/40 p-4 text-center hover:bg-muted/50 transition-colors"
                >
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {monthly.counts[s]}
                  </div>
                  <StatusBadge label={s} variant={statusToVariant(s)} />
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent History
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <ul className="divide-y bg-card">
                  {mine.slice(0, 5).map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between p-3 text-sm hover:bg-muted/30"
                    >
                      <span className="font-medium text-muted-foreground">
                        {format(new Date(a.date), "EEEE, MMM do")}
                      </span>
                      <StatusBadge
                        label={a.status}
                        variant={statusToVariant(a.status)}
                      />
                    </li>
                  ))}
                  {mine.length === 0 && (
                    <li className="p-4 text-center text-sm text-muted-foreground">
                      No attendance history found.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
