# Mission Control Dashboard — Project Notes

> Personal dashboard built with React + Supabase. Deployed on GitHub Pages.
> Live: `https://jackjames-cs.github.io/Dashboard/`

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS (custom dark theme) |
| Backend / DB | Supabase (Postgres + Auth + Storage) |
| Hosting | GitHub Pages (auto-deploys via Actions) |
| Auth | Supabase email/password |

---

## How It Works

```
src/
├── App.jsx              # Auth gate → Routes
├── components/
│   ├── Layout.jsx       # Shell: TopNav + Sidebar + RightPanel
│   ├── dashboard/       # Widget cards shown on /
│   └── ui/             # Card, DataState (spinner/error)
├── hooks/               # All data lives here (Supabase calls)
├── pages/               # Full-page views
├── data/mockData.js     # Static data (classes, bills, AI suggestions)
└── lib/supabase.js      # Supabase client
```

**Data flow:** page loads → hook fetches from Supabase → component renders.
No global state manager — each hook manages its own local state with optimistic updates.

**Tailwind colour convention (inverted!):**
`surface-50` = darkest `#0f172a` → `surface-900` = lightest `#f8fafc`

---

## Pages & Status

### ✅ Done

#### Dashboard `/`
- Widgets: Today's schedule, School assignments, Work shifts, Projects, Tasks, Finance snapshot, AI Planner
- All widgets pull live data from Supabase (except AI Planner, Calendar preview, upcoming bills)

#### School `/school`
- Assignment cards with progress bars
- Class schedule + study suggestions (static)
- Quick links: Moodle, Library, Student Portal, etc.

#### Work `/work`
- **Stats cards:**
  - Current paycheck (last Thursday's payment)
  - Expected this week (ongoing week, shows due date)
  - Hours this week / Hourly rate
- Add shifts manually or import from calendar
- Settings: hourly rate, currency, break minutes

#### Finances `/finances`
- **Month navigator** — browse any past/future month
- **Stats row:** Work earnings | Expenses | Net
- **Earnings report** — shifts grouped by pay period (Mon–Sun), shows payday date, pending periods greyed out
- **Transactions** — add income/expense, delete, Import CSV (column mapping step + preview)
- **Budget** — per-category accordion, add individual line items (monthly or weekly frequency), progress bars
- **Savings & Goals** — target/saved progress bars, add contributions, colour coded
- **Payslips** — upload PDF/image to Supabase Storage, records net/gross/notes

#### Projects `/projects`
- Kanban board (To Do / In Progress / Done)
- Drag-free — move cards between columns via buttons

#### Tasks `/tasks`
- Today / Upcoming / Overdue sections
- Add task, toggle done, delete

#### Calendar `/calendar`
- Monthly grid view
- Events by category (school/work/personal/projects)

#### Auth
- Email/password login via Supabase Auth
- All routes protected — shows login screen if no session
- Sign out button in top nav

---

### 🔲 To Do / Ideas

#### Pages (currently Placeholder)
- [ ] `/notes` — quick notes & docs
- [ ] `/automation` — workflows & triggers
- [ ] `/settings` — preferences, account

#### Work improvements
- [ ] Overtime rate (after X hours)
- [ ] Export shifts to CSV

#### Finances improvements
- [ ] Bills table (recurring expenses with due dates — replace mock data in Finance Snapshot)
- [ ] Charts — monthly spending over time, category breakdown pie
- [ ] Link payslip to a specific pay period
- [ ] Tax estimate (gross → net calculator)

#### General
- [ ] Dark/light mode toggle
- [ ] Mobile responsive layout
- [ ] Push notifications for upcoming shifts / bill due dates

---

## Pay Period Logic

Work week: **Monday → Sunday**
Payday: **Thursday of the following week** (Mon+10 days)

| Work week | Payday |
|---|---|
| Mon 24 Feb – Sun 1 Mar | Thu 5 Mar |
| Mon 2 Mar – Sun 8 Mar | Thu 12 Mar |
| Mon 9 Mar – Sun 15 Mar | Thu 19 Mar |

- Shifts only count toward **earnings** once their payday has passed
- In the earnings report, future/unpaid pay periods are shown greyed out with the upcoming payday date
- **Month grouping** uses the payday date — a Feb 28 shift paid on Mar 5 appears in the **March** report

---

## Supabase Setup

### Database Tables

| Table | Purpose |
|---|---|
| `tasks` | Today / upcoming / overdue tasks |
| `school_assignments` | Assignment cards with progress |
| `projects` | Project cards (progress, tasks left) |
| `kanban_tasks` | Kanban cards with column position |
| `schedule_events` | Daily schedule events |
| `calendar_events` | Full calendar events |
| `work_shifts` | Individual work shifts (date, start, end, role) |
| `work_settings` | Hourly rate, currency, break minutes |
| `transactions` | Income/expense transactions |
| `budgets` | Per-category monthly limits (legacy, kept for compat) |
| `budget_items` | Individual budget line items with frequency |
| `savings_goals` | Savings/debt payoff goals |
| `payslips` | Payslip records with optional file URL |

All tables have **Row Level Security** enabled — only authenticated users can read/write their data.

### Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `payslips` | Public read, auth write | PDF/image payslip uploads |

### How to Set Up (fresh start)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query** → paste and run `supabase_schema.sql`
3. Go to **Storage → New bucket** → name: `payslips`, toggle public: on
4. Copy **Project URL** and **anon public key** from Settings → API
5. Create `.env` in project root:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
6. Go to **Supabase → Authentication → Add user** to create your login
7. In **GitHub repo → Settings → Secrets → Actions**, add the same two values as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Key Files Quick Reference

| File | What it does |
|---|---|
| `src/App.jsx` | Auth check, all routes defined here |
| `src/components/Layout.jsx` | Page shell (nav, sidebar, right panel) |
| `src/data/mockData.js` | Static data — bills, AI suggestions, school classes/links |
| `src/lib/supabase.js` | Supabase client (reads .env) |
| `src/hooks/useAuth.js` | Session management, signIn, signOut |
| `src/hooks/useWork.js` | Shifts, settings, pay period calculations |
| `src/hooks/useFinances.js` | Transactions, budget items, savings goals, payslips |
| `src/hooks/useTasks.js` | Task CRUD |
| `src/hooks/useProjects.js` | Projects list |
| `src/hooks/useKanban.js` | Kanban board + moveTask |
| `src/hooks/useSchedule.js` | Daily schedule by date |
| `src/hooks/useCalendarEvents.js` | Calendar events |
| `supabase_schema.sql` | Full DB schema + seed data — run this in Supabase |
| `.github/workflows/deploy.yml` | Auto-deploy to GitHub Pages on push to main |
| `tailwind.config.js` | Custom theme (inverted surface palette, accent colours) |

---

## Deployment

Pushing to `main` triggers GitHub Actions → `npm run build` → deploys `dist/` to GitHub Pages automatically.

**Required GitHub Secrets** (Settings → Secrets → Actions):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## What's Still on Mock Data (intentional)

These aren't connected to Supabase — they're static for now:

- Upcoming bills in Finance Snapshot widget (hardcoded in `mockData.js`)
- School class schedule + study suggestions
- School quick links (Moodle, Library, etc.)
- AI Planner suggestions
- Right panel quick note / recent activity

---

*Last updated: March 2026*
