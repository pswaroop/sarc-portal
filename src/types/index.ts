// Domain types for StaffArc.
// Mirrors the Supabase schema described in the PRD so we can swap in
// real queries with no UI changes.

export type Role = "Admin" | "Manager" | "Team Lead" | "Employee";

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  role: Role;
  primary_skill: string;
  email: string;
}

export type ProjectStatus = "Active" | "Backlog" | "Completed";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  sprints: number;
  deadline: string; // ISO date
  start_date: string; // ISO date
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  employee_id: string;
  reporting_lead_id: string;
  allocation_percentage: number;
  start_date: string;
  end_date: string;
  completion_percentage: number;
  features: string[];
  lead_comments: string;
}

export interface DailyUpdate {
  id: string;
  employee_id: string;
  project_id: string;
  date: string;
  completed: string;
  in_progress: string;
  planned: string;
  has_blocker: boolean;
  blocker_description?: string;
}

export type AttendanceStatus = "Present" | "Absent" | "Half-Day" | "Leave" | "WFH";

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
}

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketState = "New" | "In Progress" | "Resolved" | "Closed";

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  priority: TicketPriority;
  state: TicketState;
  category: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
}

export type BillingType = "Fixed" | "Hourly" | "Retainer";
export type PaymentStatus = "Pending" | "Partial" | "Paid" | "Overdue";

export interface ProjectFinancial {
  project_id: string;
  client_name: string;
  project_worth: number;
  currency: string;
  billing_type: BillingType;
  payment_status: PaymentStatus;
}
