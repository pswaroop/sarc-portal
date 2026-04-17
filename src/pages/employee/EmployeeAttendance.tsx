import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance, useCheckIn } from "@/hooks/useStaffArcData";
import { StatusBadge, statusToVariant } from "@/components/StatusBadge";
import type { AttendanceStatus } from "@/types";
import { format, isSameMonth } from "date-fns";
import { toast } from "@/hooks/use-toast";

const ACTIONS: { label: string; value: AttendanceStatus }[] = [
  { label: "Present (Office)", value: "Present" },
  { label: "Work From Home", value: "WFH" },
  { label: "Leave", value: "Leave" },
];

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const { data: attendance = [] } = useAttendance();
  const checkIn = useCheckIn();

  const mine = useMemo(() => attendance.filter((a) => a.employee_id === user?.id), [attendance, user]);
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = mine.find((a) => a.date === today);

  const monthly = useMemo(() => {
    const now = new Date();
    const inMonth = mine.filter((a) => isSameMonth(new Date(a.date), now));
    const counts: Record<AttendanceStatus, number> = { Present: 0, WFH: 0, Leave: 0, Absent: 0, "Half-Day": 0 };
    inMonth.forEach((a) => { counts[a.status] += 1; });
    return { total: inMonth.length, counts };
  }, [mine]);

  const handleCheck = (status: AttendanceStatus) => {
    if (!user) return;
    checkIn.mutate({ employee_id: user.id, date: today, status });
    toast({ title: `Checked in as ${status}` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">Daily check-in and monthly summary.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">Today's check-in</h2>
            <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d, yyyy")}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEntry && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                Marked as <StatusBadge label={todayEntry.status} variant={statusToVariant(todayEntry.status)} />
              </div>
            )}
            <div className="grid gap-2">
              {ACTIONS.map((a) => (
                <Button
                  key={a.value}
                  variant={todayEntry?.status === a.value ? "default" : "outline"}
                  className={todayEntry?.status === a.value ? "bg-gradient-brand text-primary-foreground" : ""}
                  onClick={() => handleCheck(a.value)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="text-base font-semibold">This month</h2>
            <p className="text-xs text-muted-foreground">{format(new Date(), "MMMM yyyy")} · {monthly.total} entries</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(["Present", "WFH", "Half-Day", "Leave", "Absent"] as AttendanceStatus[]).map((s) => (
                <div key={s} className="rounded-lg border bg-card/40 p-3 text-center">
                  <div className="text-2xl font-semibold">{monthly.counts[s]}</div>
                  <div className="mt-1"><StatusBadge label={s} variant={statusToVariant(s)} /></div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent</h3>
              <ul className="divide-y">
                {mine.slice(0, 8).map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{format(new Date(a.date), "EEE, MMM d")}</span>
                    <StatusBadge label={a.status} variant={statusToVariant(a.status)} />
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
