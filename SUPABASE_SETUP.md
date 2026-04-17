# StaffArc — Supabase Setup

This project connects to **your existing Supabase project**. Two steps:

## 1. Add your Supabase credentials

Create a file named `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLISHABLE-KEY
```

Both keys are safe to commit (publishable). Get them from
**Supabase → Project Settings → API**.

## 2. Run the schema migration

Open **Supabase → SQL Editor → New query**, paste the SQL block below, and run it.
This refactors `role` into a separate `user_roles` table (recommended for safer RLS),
and adds the `has_role()` security-definer function plus all RLS policies.

```sql
-- Extensions
create extension if not exists "uuid-ossp";

-- App role enum
do $$ begin
  create type public.app_role as enum ('Admin','Manager','Team Lead','Employee');
exception when duplicate_object then null; end $$;

-- Employees (extends auth.users)
create table if not exists public.employees (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_code text unique,
  full_name text not null,
  primary_skill text,
  created_at timestamptz default now()
);

-- user_roles (separate table to avoid privilege escalation)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

-- Security-definer helpers
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.get_user_role()
returns public.app_role language sql stable security definer set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid()
  order by case role when 'Admin' then 1 when 'Manager' then 2 when 'Team Lead' then 3 else 4 end
  limit 1
$$;

-- Projects
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text check (status in ('Active','Backlog','Completed')) default 'Active',
  sprints text,
  deadline date,
  client_last_update date,
  created_at timestamptz default now()
);

-- Project Assignments
create table if not exists public.project_assignments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete cascade,
  reporting_lead_id uuid references public.employees(id),
  allocation_percentage integer check (allocation_percentage <= 100),
  start_date date,
  end_date date,
  completion_percentage integer default 0,
  latest_status text,
  features text,
  lead_comments text
);

-- Daily Updates
create table if not exists public.daily_updates (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  date date default current_date,
  completed text, in_progress text, planned text,
  has_blocker boolean default false,
  blocker_description text
);

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references public.employees(id) on delete cascade,
  date date default current_date,
  status text check (status in ('Present','Absent','Half-Day','Leave','WFH')),
  unique (employee_id, date)
);

-- Tickets
create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text unique not null,
  title text not null, description text,
  priority text check (priority in ('Low','Moderate','High','Critical')) default 'Moderate',
  state text check (state in ('New','In Progress','On Hold','Resolved','Closed')) default 'New',
  category text default 'Development',
  assigned_to uuid references public.employees(id),
  created_by uuid references public.employees(id),
  resolution_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project Financials (Admin-only)
create table if not exists public.project_financials (
  project_id uuid primary key references public.projects(id) on delete cascade,
  client_name text not null,
  client_contact_person text, client_email text,
  project_worth numeric(15,2),
  currency text default 'INR',
  billing_type text check (billing_type in ('Fixed Price','Time & Material','Retainer')),
  payment_status text check (payment_status in ('Pending','Partial','Paid')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create employee + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.employees (id, full_name, employee_code)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'employee_code', null));
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'Employee'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.employees enable row level security;
alter table public.user_roles enable row level security;
alter table public.projects enable row level security;
alter table public.project_assignments enable row level security;
alter table public.daily_updates enable row level security;
alter table public.attendance enable row level security;
alter table public.tickets enable row level security;
alter table public.project_financials enable row level security;

-- Policies (drop & recreate for idempotency)
drop policy if exists "Employees viewable" on public.employees;
create policy "Employees viewable" on public.employees for select to authenticated using (true);
drop policy if exists "Admins manage employees" on public.employees;
create policy "Admins manage employees" on public.employees for all to authenticated
  using (public.has_role(auth.uid(),'Admin')) with check (public.has_role(auth.uid(),'Admin'));

drop policy if exists "Users see own roles" on public.user_roles;
create policy "Users see own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'Admin'));
drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'Admin')) with check (public.has_role(auth.uid(),'Admin'));

drop policy if exists "All view projects" on public.projects;
create policy "All view projects" on public.projects for select to authenticated using (true);
drop policy if exists "Managers manage projects" on public.projects;
create policy "Managers manage projects" on public.projects for all to authenticated
  using (public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'))
  with check (public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'));

drop policy if exists "Only admins financials" on public.project_financials;
create policy "Only admins financials" on public.project_financials for all to authenticated
  using (public.has_role(auth.uid(),'Admin')) with check (public.has_role(auth.uid(),'Admin'));

drop policy if exists "All view assignments" on public.project_assignments;
create policy "All view assignments" on public.project_assignments for select to authenticated using (true);
drop policy if exists "Managers manage assignments" on public.project_assignments;
create policy "Managers manage assignments" on public.project_assignments for all to authenticated
  using (public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'))
  with check (public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'));

drop policy if exists "All view updates" on public.daily_updates;
create policy "All view updates" on public.daily_updates for select to authenticated using (true);
drop policy if exists "Insert own updates" on public.daily_updates;
create policy "Insert own updates" on public.daily_updates for insert to authenticated with check (employee_id = auth.uid());
drop policy if exists "Update own updates" on public.daily_updates;
create policy "Update own updates" on public.daily_updates for update to authenticated using (employee_id = auth.uid()) with check (employee_id = auth.uid());
drop policy if exists "Managers update updates" on public.daily_updates;
create policy "Managers update updates" on public.daily_updates for update to authenticated
  using (public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'))
  with check (public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'));

drop policy if exists "All view attendance" on public.attendance;
create policy "All view attendance" on public.attendance for select to authenticated using (true);
drop policy if exists "Insert own attendance" on public.attendance;
create policy "Insert own attendance" on public.attendance for insert to authenticated with check (employee_id = auth.uid());
drop policy if exists "Update own attendance" on public.attendance;
create policy "Update own attendance" on public.attendance for update to authenticated using (employee_id = auth.uid()) with check (employee_id = auth.uid());

drop policy if exists "All view tickets" on public.tickets;
create policy "All view tickets" on public.tickets for select to authenticated using (true);
drop policy if exists "Auth create tickets" on public.tickets;
create policy "Auth create tickets" on public.tickets for insert to authenticated with check (auth.uid() is not null);
drop policy if exists "Update relevant tickets" on public.tickets;
create policy "Update relevant tickets" on public.tickets for update to authenticated
  using (created_by=auth.uid() or assigned_to=auth.uid() or public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'))
  with check (created_by=auth.uid() or assigned_to=auth.uid() or public.has_role(auth.uid(),'Admin') or public.has_role(auth.uid(),'Manager') or public.has_role(auth.uid(),'Team Lead'));

-- Indexes
create index if not exists idx_assignments_employee on public.project_assignments(employee_id);
create index if not exists idx_assignments_project on public.project_assignments(project_id);
create index if not exists idx_daily_updates_employee on public.daily_updates(employee_id);
create index if not exists idx_daily_updates_date on public.daily_updates(date);
create index if not exists idx_daily_updates_blocker on public.daily_updates(has_blocker) where has_blocker = true;
create index if not exists idx_attendance_employee on public.attendance(employee_id);
create index if not exists idx_tickets_assigned on public.tickets(assigned_to);
create index if not exists idx_tickets_state on public.tickets(state);
```

## 3. Create your first Admin user

Since signups are disabled in the UI (admin-invite flow), create the first admin in Supabase:

1. **Auth → Users → Add user → Create new user**. Enter email + password, tick "Auto Confirm User".
2. Open SQL Editor and run:
   ```sql
   update public.user_roles set role = 'Admin' where user_id = (select id from auth.users where email='you@yourcompany.com');
   ```
   The trigger created an `Employee` row by default — this promotes you to `Admin`.
3. Sign in at `/login`. From the **Users** page you can then promote others.

## 4. Optional: customize sender email

Disable email confirmation for faster testing:
**Supabase → Authentication → Providers → Email** → toggle off "Confirm email".
