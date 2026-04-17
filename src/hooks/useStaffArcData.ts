// React Query hooks for StaffArc.
// All hooks use mock data today, but their signatures match the future
// Supabase calls so swapping is mechanical.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attendance as mockAttendance,
  dailyUpdates as mockDailyUpdates,
  employees as mockEmployees,
  projectAssignments as mockAssignments,
  projectFinancials as mockFinancials,
  projects as mockProjects,
  tickets as mockTickets,
} from "@/mocks/data";
import type {
  Attendance,
  DailyUpdate,
  Employee,
  ProjectAssignment,
  ProjectFinancial,
  Project,
  Role,
  Ticket,
  TicketState,
} from "@/types";

const wait = <T,>(data: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(data), ms));

export const queryKeys = {
  employees: ["employees"] as const,
  projects: ["projects"] as const,
  assignments: ["assignments"] as const,
  dailyUpdates: ["daily-updates"] as const,
  attendance: ["attendance"] as const,
  tickets: ["tickets"] as const,
  financials: ["financials"] as const,
};

export const useEmployees = () =>
  useQuery({ queryKey: queryKeys.employees, queryFn: () => wait<Employee[]>(mockEmployees) });

export const useProjects = () =>
  useQuery({ queryKey: queryKeys.projects, queryFn: () => wait<Project[]>(mockProjects) });

export const useAssignments = () =>
  useQuery({ queryKey: queryKeys.assignments, queryFn: () => wait<ProjectAssignment[]>(mockAssignments) });

export const useDailyUpdates = () =>
  useQuery({ queryKey: queryKeys.dailyUpdates, queryFn: () => wait<DailyUpdate[]>(mockDailyUpdates) });

export const useAttendance = () =>
  useQuery({ queryKey: queryKeys.attendance, queryFn: () => wait<Attendance[]>(mockAttendance) });

export const useTickets = () =>
  useQuery({ queryKey: queryKeys.tickets, queryFn: () => wait<Ticket[]>(mockTickets) });

export const useFinancials = () =>
  useQuery({ queryKey: queryKeys.financials, queryFn: () => wait<ProjectFinancial[]>(mockFinancials) });

// ---- Mutations (operate on in-memory mock arrays) ----

export const useSubmitDailyUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: Omit<DailyUpdate, "id">) => {
      const newUpdate: DailyUpdate = { ...update, id: `d-${Date.now()}` };
      mockDailyUpdates.unshift(newUpdate);
      return wait(newUpdate);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.dailyUpdates }),
  });
};

export const useUpdateTicketState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, state }: { id: string; state: TicketState }) => {
      const t = mockTickets.find((x) => x.id === id);
      if (t) t.state = state;
      return wait(t);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

export const useReassignTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      const t = mockTickets.find((x) => x.id === id);
      if (t) t.assigned_to = employeeId;
      return wait(t);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const e = mockEmployees.find((x) => x.id === id);
      if (e) e.role = role;
      return wait(e);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
};

export const useUpdateFinancial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (next: ProjectFinancial) => {
      const idx = mockFinancials.findIndex((f) => f.project_id === next.project_id);
      if (idx >= 0) mockFinancials[idx] = next;
      else mockFinancials.push(next);
      return wait(next);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.financials }),
  });
};

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<Attendance, "id">) => {
      const today = entry.date;
      const existing = mockAttendance.find((a) => a.employee_id === entry.employee_id && a.date === today);
      if (existing) existing.status = entry.status;
      else mockAttendance.unshift({ ...entry, id: `att-${Date.now()}` });
      return wait(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.attendance }),
  });
};

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Omit<ProjectAssignment, "id">) => {
      const created: ProjectAssignment = { ...a, id: `a-${Date.now()}` };
      mockAssignments.unshift(created);
      return wait(created);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assignments }),
  });
};
