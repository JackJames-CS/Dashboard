-- ============================================================
-- Mission Control Dashboard — Supabase Schema + Seed Data
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Tables

create table tasks (
  id         bigint generated always as identity primary key,
  title      text        not null,
  done       boolean     not null default false,
  status     text        not null default 'today' check (status in ('today', 'upcoming', 'overdue')),
  due        text,
  overdue    text,
  category   text        not null default 'personal' check (category in ('school', 'work', 'personal')),
  created_at timestamptz not null default now()
);

create table school_assignments (
  id         bigint generated always as identity primary key,
  title      text        not null,
  course     text        not null,
  due        text        not null,
  progress   integer     not null default 0 check (progress between 0 and 100),
  priority   text        not null default 'medium' check (priority in ('high', 'medium', 'low')),
  created_at timestamptz not null default now()
);

create table projects (
  id            bigint generated always as identity primary key,
  name          text        not null,
  progress      integer     not null default 0 check (progress between 0 and 100),
  tasks_left    integer     not null default 0,
  last_activity text        not null default 'just now',
  color         text        not null default 'blue' check (color in ('blue', 'violet', 'emerald', 'amber', 'indigo')),
  created_at    timestamptz not null default now()
);

create table kanban_tasks (
  id         bigint generated always as identity primary key,
  title      text        not null,
  project    text        not null default '',
  column_id  text        not null default 'todo' check (column_id in ('todo', 'progress', 'done')),
  position   integer     not null default 0,
  created_at timestamptz not null default now()
);

create table schedule_events (
  id         bigint generated always as identity primary key,
  time       text        not null,
  title      text        not null,
  type       text        not null default 'personal' check (type in ('work', 'school', 'personal')),
  duration   integer     not null default 30,
  day_date   date        not null default current_date,
  created_at timestamptz not null default now()
);

create table calendar_events (
  id         bigint generated always as identity primary key,
  title      text        not null,
  start      text        not null,
  "end"      text        not null,
  category   text        not null default 'personal' check (category in ('school', 'work', 'personal', 'projects')),
  day        integer     not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Seed Data (mirrors mockData.js)
-- ============================================================

-- tasks
insert into tasks (title, done, status, due, overdue, category) values
  ('Submit algorithms HW4', false, 'today',    null,     null,      'school'),
  ('Review PR #42',         true,  'today',    null,     null,      'work'),
  ('Grocery run',           false, 'today',    null,     null,      'personal'),
  ('Call dentist',          false, 'today',    null,     null,      'personal'),
  ('Prepare for midterm',   false, 'upcoming', 'Mar 12', null,      'school'),
  ('Team retrospective',    false, 'upcoming', 'Mar 14', null,      'work'),
  ('Update resume',         false, 'overdue',  null,     '2 days',  'personal');

-- school_assignments
insert into school_assignments (title, course, due, progress, priority) values
  ('Algorithms HW4',       'CS 301',   'Mar 8, 11:59 PM', 60, 'high'),
  ('LA Problem Set 5',     'MATH 202', 'Mar 10',          30, 'medium'),
  ('Research paper draft', 'ENG 400',  'Mar 15',          20, 'medium'),
  ('Lab report 3',         'PHY 101',  'Mar 18',           0, 'low');

-- projects
insert into projects (name, progress, tasks_left, last_activity, color) values
  ('Portfolio site', 75, 3,  '2h ago', 'blue'),
  ('Capstone MVP',   40, 12, '1d ago', 'violet'),
  ('API integration',90, 1,  '5h ago', 'emerald'),
  ('Design system',  25, 8,  '3d ago', 'amber');

-- kanban_tasks
insert into kanban_tasks (title, project, column_id, position) values
  ('Design hero section',  'Portfolio',       'todo',     0),
  ('Set up staging env',   'Capstone',        'todo',     1),
  ('Implement auth flow',  'Capstone',        'progress', 0),
  ('Write API docs',       'API integration', 'progress', 1),
  ('Landing page layout',  'Portfolio',       'done',     0);

-- schedule_events (use today's date — change '2026-03-07' to match your test date)
insert into schedule_events (time, title, type, duration, day_date) values
  ('08:00', 'Morning standup',       'work',     15, '2026-03-07'),
  ('09:30', 'CS 301 — Algorithms',   'school',   90, '2026-03-07'),
  ('12:00', 'Lunch break',           'personal', 45, '2026-03-07'),
  ('14:00', 'Project sync',          'work',     60, '2026-03-07'),
  ('16:30', 'Study block — Math',    'school',   90, '2026-03-07'),
  ('19:00', 'Gym',                   'personal', 60, '2026-03-07');

-- calendar_events
insert into calendar_events (title, start, "end", category, day) values
  ('CS 301 Lecture', '09:30', '11:00', 'school',   5),
  ('Project sync',   '14:00', '15:00', 'work',     5),
  ('Study block',    '16:30', '18:00', 'school',   5),
  ('Team standup',   '09:00', '09:30', 'work',     6),
  ('Dentist',        '11:00', '11:30', 'personal', 6);

-- ============================================================
-- Work tables (Step 0 — run after initial schema if needed)
-- ============================================================

create table work_shifts (
  id         bigint generated always as identity primary key,
  shift_date date        not null,
  start_time text        not null,
  end_time   text        not null,
  role       text        not null default 'Support',
  notes      text        not null default '',
  created_at timestamptz not null default now()
);

create table work_settings (
  id             bigint generated always as identity primary key,
  hourly_rate    numeric(6,2) not null default 16.00,
  currency       text         not null default 'EUR',
  break_minutes  integer      not null default 30,
  created_at     timestamptz  not null default now()
);

alter table work_shifts enable row level security;
alter table work_settings enable row level security;
create policy "auth only" on work_shifts for all using (auth.role() = 'authenticated');
create policy "auth only" on work_settings for all using (auth.role() = 'authenticated');

-- One settings row
insert into work_settings (hourly_rate, currency) values (16.00, 'EUR');

-- ============================================================
-- Finances tables (run after work tables if needed)
-- ============================================================

create table transactions (
  id          bigint generated always as identity primary key,
  txn_date    date          not null default current_date,
  description text          not null,
  amount      numeric(10,2) not null,
  category    text          not null default 'other',
  type        text          not null default 'expense' check (type in ('income', 'expense')),
  created_at  timestamptz   not null default now()
);

create table budgets (
  id           bigint generated always as identity primary key,
  category     text          not null,
  month        text          not null,  -- 'YYYY-MM'
  limit_amount numeric(10,2) not null default 0,
  created_at   timestamptz   not null default now(),
  unique(category, month)
);

create table payslips (
  id          bigint generated always as identity primary key,
  pay_date    date          not null,
  net_pay     numeric(10,2) not null,
  gross_pay   numeric(10,2),
  file_url    text,
  notes       text          not null default '',
  created_at  timestamptz   not null default now()
);

alter table transactions enable row level security;
alter table budgets enable row level security;
alter table payslips enable row level security;
create policy "auth only" on transactions for all using (auth.role() = 'authenticated');
create policy "auth only" on budgets for all using (auth.role() = 'authenticated');
create policy "auth only" on payslips for all using (auth.role() = 'authenticated');

-- Supabase Storage: create a bucket named 'payslips' (public: true)
-- in Supabase Dashboard → Storage → New bucket → name: payslips, public: true

-- ============================================================
-- Budget items + Savings goals (run after finances tables)
-- ============================================================

create table budget_items (
  id        bigint generated always as identity primary key,
  category  text          not null,
  name      text          not null,
  amount    numeric(10,2) not null default 0,
  frequency text          not null default 'monthly' check (frequency in ('monthly', 'weekly')),
  created_at timestamptz  not null default now()
);

create table savings_goals (
  id            bigint generated always as identity primary key,
  name          text          not null,
  target_amount numeric(10,2) not null,
  saved_amount  numeric(10,2) not null default 0,
  deadline      date,
  color         text          not null default 'emerald' check (color in ('emerald', 'blue', 'indigo', 'violet', 'amber')),
  notes         text          not null default '',
  created_at    timestamptz   not null default now()
);

alter table budget_items enable row level security;
alter table savings_goals enable row level security;
create policy "auth only" on budget_items for all using (auth.role() = 'authenticated');
create policy "auth only" on savings_goals for all using (auth.role() = 'authenticated');

-- ============================================================
-- Tasks: add priority + due_date columns (run if tasks table exists)
-- ============================================================

alter table tasks add column if not exists priority text not null default 'medium' check (priority in ('high', 'medium', 'low'));
alter table tasks add column if not exists due_date date;
alter table tasks add column if not exists completed_at timestamptz;

-- ============================================================
-- School modules / grade tracker
-- ============================================================

create table school_modules (
  id          bigint generated always as identity primary key,
  name        text          not null,
  credits     numeric(4,1)  not null default 5,
  exam_weight integer       not null default 60 check (exam_weight between 0 and 100),
  exam_mark   numeric(5,2),
  ca_mark     numeric(5,2),
  color       text          not null default 'indigo' check (color in ('blue', 'violet', 'emerald', 'amber', 'indigo')),
  created_at  timestamptz   not null default now()
);

alter table school_modules enable row level security;
create policy "auth only" on school_modules for all using (auth.role() = 'authenticated');
