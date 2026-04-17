// Domain types for StaffArc — aligned with Supabase schema.

export type Role = "Admin" | "Manager" | "Team Lead" | "Employee";

export interface Employee {
  id: string;
  employee_code: string | null;
  full_name: string;
  role: Role; // resolved from user_roles in code
  primary_skill: string | null;
  email?: string;
  created_at?: string;
}

export type ProjectStatus = "Active" | "Backlog" | "Completed";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  sprints: string | null;
  deadline: string | null;
  client_last_update: string | null;
  created_at?: string;
}

export interface ProjectAssignment {
  id: string;
  project_id: string;
  employee_id: string;
  reporting_lead_id: string | null;
  allocation_percentage: number | null;
  start_date: string | null;
  end_date: string | null;
  completion_percentage: number;
  latest_status: string | null;
  features: string | null;
  lead_comments: string | null;
}

export interface DailyUpdate {
  id: string;
  employee_id: string;
  project_id: string;
  date: string;
  completed: string | null;
  in_progress: string | null;
  planned: string | null;
  has_blocker: boolean;
  blocker_description: string | null;
}

export type AttendanceStatus = "Present" | "Absent" | "Half-Day" | "Leave" | "WFH";

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
}

export type TicketPriority = "Low" | "Moderate" | "High" | "Critical";
export type TicketState = "New" | "In Progress" | "On Hold" | "Resolved" | "Closed";

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  priority: TicketPriority;
  state: TicketState;
  category: string;
  assigned_to: string | null;
  created_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BillingType = "Fixed Price" | "Time & Material" | "Retainer";
export type PaymentStatus = "Pending" | "Partial" | "Paid";

export interface ProjectFinancial {
  project_id: string;
  client_name: string;
  client_contact_person: string | null;
  client_email: string | null;
  project_worth: number | null;
  currency: string;
  billing_type: BillingType | null;
  payment_status: PaymentStatus | null;
}
