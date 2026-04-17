import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "success" | "warning" | "destructive" | "info" | "primary";

const VARIANT_CLASSES: Record<Variant, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  primary: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: {
  label: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(VARIANT_CLASSES[variant], "font-medium", className)}>
      {label}
    </Badge>
  );
}

export function statusToVariant(status: string): Variant {
  const map: Record<string, Variant> = {
    Active: "success",
    Completed: "info",
    Backlog: "neutral",
    Present: "success",
    WFH: "info",
    "Half-Day": "warning",
    Leave: "warning",
    Absent: "destructive",
    New: "info",
    "In Progress": "warning",
    Resolved: "success",
    Closed: "neutral",
    Low: "neutral",
    Moderate: "info",
    High: "warning",
    Critical: "destructive",
    "On Hold": "warning",
    Paid: "success",
    Pending: "warning",
    Partial: "info",
    "Fixed Price": "neutral",
    "Time & Material": "info",
    Retainer: "primary",
    Admin: "primary",
    Manager: "info",
    "Team Lead": "info",
    Employee: "neutral",
  };
  return map[status] ?? "neutral";
}
