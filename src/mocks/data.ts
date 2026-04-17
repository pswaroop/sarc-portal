import {
  Employee,
  Project,
  ProjectAssignment,
  DailyUpdate,
  Attendance,
  Ticket,
  ProjectFinancial,
} from "@/types";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const offset = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return iso(d);
};

export const employees: Employee[] = [
  { id: "u1", employee_code: "SA-001", full_name: "Aarav Sharma", role: "Admin", primary_skill: "Platform", email: "aarav@staffarc.io" },
  { id: "u2", employee_code: "SA-002", full_name: "Priya Iyer", role: "Manager", primary_skill: "Product Mgmt", email: "priya@staffarc.io" },
  { id: "u3", employee_code: "SA-003", full_name: "Rohan Mehta", role: "Team Lead", primary_skill: "Frontend", email: "rohan@staffarc.io" },
  { id: "u4", employee_code: "SA-004", full_name: "Sara Khan", role: "Team Lead", primary_skill: "Backend", email: "sara@staffarc.io" },
  { id: "u5", employee_code: "SA-005", full_name: "Vikram Patel", role: "Employee", primary_skill: "React", email: "vikram@staffarc.io" },
  { id: "u6", employee_code: "SA-006", full_name: "Neha Gupta", role: "Employee", primary_skill: "Node.js", email: "neha@staffarc.io" },
  { id: "u7", employee_code: "SA-007", full_name: "Arjun Rao", role: "Employee", primary_skill: "QA Automation", email: "arjun@staffarc.io" },
  { id: "u8", employee_code: "SA-008", full_name: "Isha Verma", role: "Employee", primary_skill: "UI/UX", email: "isha@staffarc.io" },
];

export const projects: Project[] = [
  { id: "p1", name: "Atlas CRM Revamp", status: "Active", sprints: 6, start_date: offset(-40), deadline: offset(20) },
  { id: "p2", name: "Helios Billing Engine", status: "Active", sprints: 8, start_date: offset(-60), deadline: offset(10) },
  { id: "p3", name: "Nova Mobile App", status: "Active", sprints: 4, start_date: offset(-20), deadline: offset(40) },
  { id: "p4", name: "Orion Analytics", status: "Backlog", sprints: 5, start_date: offset(15), deadline: offset(90) },
  { id: "p5", name: "Pulse Internal Tools", status: "Completed", sprints: 3, start_date: offset(-120), deadline: offset(-10) },
];

export const projectAssignments: ProjectAssignment[] = [
  {
    id: "a1", project_id: "p1", employee_id: "u5", reporting_lead_id: "u3",
    allocation_percentage: 80, start_date: offset(-40), end_date: offset(20),
    completion_percentage: 45,
    features: ["Lead pipeline UI", "Activity timeline", "Filters & saved views"],
    lead_comments: "Strong velocity on UI. Coordinate with backend on the activity stream API.",
  },
  {
    id: "a2", project_id: "p2", employee_id: "u5", reporting_lead_id: "u4",
    allocation_percentage: 20, start_date: offset(-30), end_date: offset(10),
    completion_percentage: 30,
    features: ["Invoice PDF templates"],
    lead_comments: "Pending design approval on the new template.",
  },
  {
    id: "a3", project_id: "p1", employee_id: "u6", reporting_lead_id: "u3",
    allocation_percentage: 60, start_date: offset(-40), end_date: offset(20),
    completion_percentage: 55,
    features: ["Auth", "Permissions matrix"],
    lead_comments: "Good. Add audit logging this sprint.",
  },
  {
    id: "a4", project_id: "p2", employee_id: "u7", reporting_lead_id: "u4",
    allocation_percentage: 100, start_date: offset(-60), end_date: offset(10),
    completion_percentage: 35,
    features: ["E2E test suite", "Load testing"],
    lead_comments: "Lagging — needs more test coverage on retries.",
  },
  {
    id: "a5", project_id: "p3", employee_id: "u8", reporting_lead_id: "u3",
    allocation_percentage: 70, start_date: offset(-20), end_date: offset(40),
    completion_percentage: 40,
    features: ["Onboarding flow", "Profile screens"],
    lead_comments: "Crisp work on onboarding.",
  },
];

export const dailyUpdates: DailyUpdate[] = [
  {
    id: "d1", employee_id: "u5", project_id: "p1", date: offset(0),
    completed: "Wired up lead filters; fixed pagination bug.",
    in_progress: "Saved views modal.",
    planned: "Activity timeline component.",
    has_blocker: true,
    blocker_description: "Waiting on activity feed API contract from backend.",
  },
  {
    id: "d2", employee_id: "u7", project_id: "p2", date: offset(0),
    completed: "Added retry test cases.",
    in_progress: "Load test scripts.",
    planned: "Webhook flake fix.",
    has_blocker: true,
    blocker_description: "Staging env unstable — need infra help.",
  },
  {
    id: "d3", employee_id: "u6", project_id: "p1", date: offset(-1),
    completed: "Permissions matrix UI.",
    in_progress: "Audit logging.",
    planned: "Role assignment screens.",
    has_blocker: false,
  },
];

export const attendance: Attendance[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `att-${i}`,
  employee_id: "u5",
  date: offset(-i),
  status: i % 7 === 0 ? "WFH" : i % 11 === 0 ? "Leave" : "Present",
}));

export const tickets: Ticket[] = [
  { id: "t1", ticket_number: "INC0010234", title: "VPN drops every 30 minutes", description: "Repeated disconnects on corporate VPN.", priority: "High", state: "New", category: "Network", assigned_to: "u5", created_by: "u2", created_at: offset(-1) },
  { id: "t2", ticket_number: "INC0010240", title: "Laptop replacement request", description: "Battery degraded.", priority: "Medium", state: "In Progress", category: "Hardware", assigned_to: "u5", created_by: "u8", created_at: offset(-3) },
  { id: "t3", ticket_number: "INC0010251", title: "Access to BI dashboard", description: "Need viewer role.", priority: "Low", state: "Resolved", category: "Access", assigned_to: "u6", created_by: "u7", created_at: offset(-5) },
  { id: "t4", ticket_number: "INC0010260", title: "Production deploy failed", description: "Pipeline stuck on test stage.", priority: "Critical", state: "In Progress", category: "DevOps", assigned_to: "u7", created_by: "u4", created_at: offset(0) },
  { id: "t5", ticket_number: "INC0010272", title: "SSO login loop on Safari", description: "Users redirected repeatedly.", priority: "High", state: "New", category: "Auth", assigned_to: "u5", created_by: "u3", created_at: offset(0) },
];

export const projectFinancials: ProjectFinancial[] = [
  { project_id: "p1", client_name: "Atlas Group", project_worth: 145000, currency: "USD", billing_type: "Fixed", payment_status: "Partial" },
  { project_id: "p2", client_name: "Helios Pay Inc.", project_worth: 220000, currency: "USD", billing_type: "Hourly", payment_status: "Pending" },
  { project_id: "p3", client_name: "Nova Labs", project_worth: 98000, currency: "USD", billing_type: "Fixed", payment_status: "Paid" },
  { project_id: "p4", client_name: "Orion Holdings", project_worth: 60000, currency: "USD", billing_type: "Retainer", payment_status: "Pending" },
  { project_id: "p5", client_name: "Pulse Internal", project_worth: 40000, currency: "USD", billing_type: "Fixed", payment_status: "Paid" },
];
