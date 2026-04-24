-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. users table (Profiles)
create type user_role as enum ('admin', 'reviewer', 'viewer', 'department_head');

create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role user_role not null default 'viewer',
  department_id uuid, -- FK added later
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. departments table
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  code text not null,
  head_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add FK to users now that departments table exists
alter table public.users add constraint fk_department foreign key (department_id) references public.departments(id) on delete set null;

-- 3. cases table
create type case_status as enum ('processing', 'extracted', 'pending_review', 'verified', 'rejected');

create table public.cases (
  id uuid default uuid_generate_v4() primary key,
  case_number text unique, -- Can be null initially if auto-extracted later
  case_title text,
  court_name text,
  judgment_date date,
  uploaded_by uuid references public.users(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  pdf_url text not null,
  pdf_filename text not null,
  status case_status default 'processing' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. extractions table
create table public.extractions (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  case_number text,
  case_title text,
  petitioner text,
  respondent text,
  court_name text,
  judge_name text,
  date_of_order date,
  key_directions jsonb,
  parties_involved jsonb,
  timelines jsonb,
  appeal_limitation_period text,
  case_outcome text,
  subject_matter text,
  confidence_score float,
  extraction_notes text,
  raw_extracted_text text,
  ai_model_used text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. action_plans table
create type action_plan_type as enum ('compliance', 'appeal', 'both', 'no_action');
create type priority_level as enum ('critical', 'high', 'medium', 'low');

create table public.action_plans (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  extraction_id uuid references public.extractions(id) on delete cascade not null,
  action_type action_plan_type not null,
  priority_level priority_level not null default 'medium',
  summary text,
  ai_reasoning text,
  compliance_actions jsonb,
  appeal_consideration jsonb,
  responsible_departments jsonb,
  key_timelines jsonb,
  interdepartmental_coordination text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. verifications table
create type verification_status as enum ('approved', 'rejected', 'edited_and_approved');

create table public.verifications (
  id uuid default uuid_generate_v4() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  extraction_id uuid references public.extractions(id) on delete cascade not null,
  action_plan_id uuid references public.action_plans(id) on delete cascade not null,
  reviewer_id uuid references public.users(id) on delete set null,
  status verification_status not null,
  reviewer_notes text,
  edited_extraction jsonb,
  edited_action_plan jsonb,
  reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. audit_logs table
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete set null,
  case_id uuid references public.cases(id) on delete cascade,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) on all tables
alter table public.users enable row level security;
alter table public.departments enable row level security;
alter table public.cases enable row level security;
alter table public.extractions enable row level security;
alter table public.action_plans enable row level security;
alter table public.verifications enable row level security;
alter table public.audit_logs enable row level security;

-- Basic RLS Policies (Update these for production)
create policy "Users can view all users" on public.users for select using (true);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = id);

create policy "Anyone can view departments" on public.departments for select using (true);

create policy "Users can view cases" on public.cases for select using (true);
create policy "Users can insert cases" on public.cases for insert with check (auth.uid() = uploaded_by);
create policy "Users can update cases" on public.cases for update using (true); -- simplify for demo

create policy "Users can view extractions" on public.extractions for select using (true);
create policy "Users can insert extractions" on public.extractions for insert with check (true);

create policy "Users can view action_plans" on public.action_plans for select using (true);
create policy "Users can insert action_plans" on public.action_plans for insert with check (true);

create policy "Users can view verifications" on public.verifications for select using (true);
create policy "Users can insert verifications" on public.verifications for insert with check (auth.uid() = reviewer_id);

create policy "Users can view audit_logs" on public.audit_logs for select using (true);
create policy "Users can insert audit_logs" on public.audit_logs for insert with check (auth.uid() = user_id);

-- Setup Storage for PDFs
insert into storage.buckets (id, name, public) values ('judgments', 'judgments', false);
create policy "Authenticated users can upload judgments" on storage.objects for insert to authenticated with check (bucket_id = 'judgments');
create policy "Authenticated users can read judgments" on storage.objects for select to authenticated using (bucket_id = 'judgments');
