// React Query hooks backed by Supabase.
// Signatures preserved so pages need no rewrites beyond schema field renames.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export const queryKeys = {
  employees: ["employees"] as const,
  projects: ["projects"] as const,
  assignments: ["assignments"] as const,
  dailyUpdates: ["daily-updates"] as const,
  attendance: ["attendance"] as const,
  tickets: ["tickets"] as const,
  financials: ["financials"] as const,
};

// ---------- Queries ----------

export const useEmployees = () =>
  useQuery({
    queryKey: queryKeys.employees,
    queryFn: async (): Promise<Employee[]> => {
      const { data: emps, error } = await supabase
        .from("employees")
        .select("id, employee_code, full_name, primary_skill, created_at");
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const roleByUser = new Map<string, Role>();
      (roles ?? []).forEach((r: { user_id: string; role: Role }) => {
        const cur = roleByUser.get(r.user_id);
        const rank = (x: Role) =>
          x === "Admin" ? 1 : x === "Manager" ? 2 : x === "Team Lead" ? 3 : 4;
        if (!cur || rank(r.role) < rank(cur)) roleByUser.set(r.user_id, r.role);
      });
      return (emps ?? []).map((e) => ({
        id: e.id,
        employee_code: e.employee_code,
        full_name: e.full_name,
        primary_skill: e.primary_skill,
        role: roleByUser.get(e.id) ?? "Employee",
        created_at: e.created_at,
      }));
    },
  });

export const useProjects = () =>
  useQuery({
    queryKey: queryKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

export const useAssignments = () =>
  useQuery({
    queryKey: queryKeys.assignments,
    queryFn: async (): Promise<ProjectAssignment[]> => {
      const { data, error } = await supabase.from("project_assignments").select("*");
      if (error) throw error;
      return (data ?? []) as ProjectAssignment[];
    },
  });

export const useDailyUpdates = () =>
  useQuery({
    queryKey: queryKeys.dailyUpdates,
    queryFn: async (): Promise<DailyUpdate[]> => {
      const { data, error } = await supabase
        .from("daily_updates")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DailyUpdate[];
    },
  });

export const useAttendance = () =>
  useQuery({
    queryKey: queryKeys.attendance,
    queryFn: async (): Promise<Attendance[]> => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Attendance[];
    },
  });

export const useTickets = () =>
  useQuery({
    queryKey: queryKeys.tickets,
    queryFn: async (): Promise<Ticket[]> => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Ticket[];
    },
  });

export const useFinancials = () =>
  useQuery({
    queryKey: queryKeys.financials,
    queryFn: async (): Promise<ProjectFinancial[]> => {
      const { data, error } = await supabase.from("project_financials").select("*");
      if (error) {
        // Non-admins will get RLS denials — return empty silently.
        if (error.code === "PGRST301" || error.message.toLowerCase().includes("permission")) return [];
        throw error;
      }
      return (data ?? []) as ProjectFinancial[];
    },
    retry: false,
  });

// ---------- Mutations ----------

export const useSubmitDailyUpdate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: Omit<DailyUpdate, "id">) => {
      const { data, error } = await supabase.from("daily_updates").insert(update).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.dailyUpdates }),
  });
};

export const useUpdateTicketState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, state }: { id: string; state: TicketState }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ state, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

export const useReassignTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ assigned_to: employeeId, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      // Replace existing role rows for the user with the new single role
      await supabase.from("user_roles").delete().eq("user_id", id);
      const { error } = await supabase.from("user_roles").insert({ user_id: id, role });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
};

export const useUpdateFinancial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (next: ProjectFinancial) => {
      const { error } = await supabase
        .from("project_financials")
        .upsert({ ...next, updated_at: new Date().toISOString() }, { onConflict: "project_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.financials }),
  });
};

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<Attendance, "id">) => {
      const { error } = await supabase
        .from("attendance")
        .upsert(entry, { onConflict: "employee_id,date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.attendance }),
  });
};

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Omit<ProjectAssignment, "id">) => {
      const { data, error } = await supabase.from("project_assignments").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assignments }),
  });
};

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Omit<Ticket, "id" | "ticket_number" | "created_at" | "updated_at">) => {
      // Auto-generate a random ticket number (e.g. TKT-8F2A)
      const ticketNumber = `TKT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          ...t,
          ticket_number: ticketNumber,
          assigned_to: t.assigned_to === "unassigned" ? null : t.assigned_to,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

// ---------- Additional Admin/Employee CRUD Mutations ----------

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: any) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: project.name,
          status: project.status,
          deadline: project.deadline || null,
          sprints: project.sprints || null,
          project_type: project.project_type || null,
          other_details: project.other_details || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
};

export const useDeleteAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assignments }),
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Deleting a project automatically cascades to assignments and financials via SQL
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.assignments });
      qc.invalidateQueries({ queryKey: queryKeys.financials });
    },
  });
};

export const useDeleteTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Employee> }) => {
      const { error } = await supabase
        .from("employees")
        .update({
          full_name: payload.full_name,
          employee_code: payload.employee_code,
          primary_skill: payload.primary_skill,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.employees }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<Project> & { id: string }) => {
      const { error } = await supabase.from("projects").update(p).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
};

export const useUpdateTicketFull = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: Partial<Ticket> & { id: string }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ ...t, updated_at: new Date().toISOString() })
        .eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};

export const useUpdateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<ProjectAssignment> & { id: string }) => {
      const { error } = await supabase
        .from("project_assignments")
        .update(a)
        .eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.assignments }),
  });
};