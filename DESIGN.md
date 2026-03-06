# Personal AI Mission Control Dashboard — Design Document

## 1. UI Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP NAV BAR                                                                  │
│ [⌘K Search / command bar]     [Quick add] [Notifications] [AI] [Avatar]       │
├──────────────┬──────────────────────────────────────────────┬────────────────┤
│              │                                              │                │
│  SIDEBAR     │           MAIN CONTENT AREA                  │  RIGHT PANEL   │
│  (icons +    │           (dashboard grid or                  │  (quick tools) │
│   labels)    │            page content)                      │                │
│              │                                              │  • Quick note  │
│  Dashboard   │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │  • Recent     │
│  School      │  │ Today   │ │ School  │ │ Work    │          │  • Quick task │
│  Work        │  └─────────┘ └─────────┘ └─────────┘          │  • AI chat    │
│  Projects    │  ┌─────────┐ ┌─────────┐ ┌─────────┐          │                │
│  Calendar    │  │Projects │ │ Tasks   │ │Calendar │          │                │
│  Tasks       │  └─────────┘ └─────────┘ └─────────┘          │                │
│  Finances    │  ┌─────────┐ ┌─────────┐                     │                │
│  Notes       │  │ Finance │ │ AI Plan │                     │                │
│  AI Agents   │  └─────────┘ └─────────┘                     │                │
│  Automation  │                                              │                │
│  Settings    │                                              │                │
└──────────────┴──────────────────────────────────────────────┴────────────────┘
```

- **Top bar**: Fixed height (~56px), sticky. Search is primary; quick add, notifications, AI, profile on the right.
- **Sidebar**: Fixed width (240px). Icons + labels; active state with accent background.
- **Main**: Scrollable; padding and responsive grid.
- **Right panel**: Fixed width (320px). Optional quick tools; can be collapsed in a future iteration.

---

## 2. Component Hierarchy

```
App
├── Routes
│   └── Layout (Outlet)
│       ├── TopNav
│       ├── Sidebar (NavLinks)
│       ├── <main> → Outlet (page component)
│       └── RightPanel
│
├── pages/
│   ├── Dashboard
│   │   ├── TodayPanel (Card)
│   │   ├── SchoolPanel (Card)
│   │   ├── WorkPanel (Card)
│   │   ├── ProjectsPanel (Card)
│   │   ├── TasksPanel (Card)
│   │   ├── CalendarPreview (Card)
│   │   ├── FinanceSnapshot (Card)
│   │   └── AIPlannerPanel (Card)
│   ├── School
│   │   ├── Assignment cards (grid)
│   │   ├── Card (Lecture schedule)
│   │   └── Card (Study planner + links)
│   ├── Projects
│   │   ├── Card (Project overview)
│   │   ├── Kanban columns (To Do / In Progress / Done)
│   │   └── Cards (Notes, Files, AI)
│   ├── Tasks
│   │   ├── View toggle (list / kanban / calendar)
│   │   └── Card(s) per view
│   ├── Calendar
│   │   ├── View toggle (day / week / month)
│   │   └── Card (calendar content)
│   └── Placeholder (Work, Finances, Notes, AI Agents, Automation, Settings)
│
├── components/
│   ├── ui/
│   │   └── Card (title, subtitle, action, children)
│   ├── dashboard/
│   │   ├── TodayPanel, SchoolPanel, WorkPanel
│   │   ├── ProjectsPanel, TasksPanel, CalendarPreview
│   │   └── FinanceSnapshot, AIPlannerPanel
│   ├── TopNav, Sidebar, RightPanel
│   └── Layout
│
└── data/
    └── mockData.js (all placeholder data)
```

---

## 3. Visual Layout Explanation

- **Style**: Modern, minimal, information-dense. Card-based layout with rounded corners (`rounded-xl`), soft shadows (`shadow-card`, `shadow-panel`), and consistent spacing (`p-4`, `gap-4`, `space-y-6`).
- **Colors**: Neutral surface palette (slate-like); accent colors for actions and categories (indigo/blue primary, violet, emerald, amber). Category coding: School = violet, Work = blue, Personal = emerald, Projects = amber.
- **Typography**: Inter for UI; optional mono for time/code. Clear hierarchy: page title (2xl bold), card titles (sm semibold), body (sm), captions (xs).
- **Dashboard grid**: Three columns on large screens; widgets are visually separated cards. Each card has a header (title ± subtitle ± action link) and body.
- **No backend**: All data is in `src/data/mockData.js`. No API calls, no state persistence.

---

## 4. Mock Data Summary (inside widgets)

| Widget / Page   | Mock data used |
|-----------------|----------------|
| Today           | `todaySchedule`: time, title, type (work/school/personal), duration |
| School          | `schoolData`: assignments (name, due, progress, course), classes (name, time, room), studySuggestions |
| Work            | `workData`: shifts (day, time, role), hoursThisWeek, estimatedIncome |
| Projects        | `projectsData`: name, progress, tasksLeft, lastActivity, color |
| Tasks           | `tasksData`: today (title, done), upcoming (title, due), overdue (title, overdue) |
| Calendar preview| `calendarWeekEvents`: day, date, events count |
| Finance         | `financeSnapshot`: monthlySpending, monthlyIncome, upcomingBills |
| AI Planner      | `aiPlannerSuggestions`: dailySchedule, studyRec, focusBlocks |
| Right panel     | `rightPanelData`: quickNote, recentActivity, quickTasks |
| School page     | `schoolAssignmentsPage`: title, course, due, progress, priority |
| Projects page   | `kanbanColumns`: todo / progress / done with task items |
| Calendar page   | `calendarPageEvents`: title, start, end, category, day |

---

## 5. Page-by-Page UI Breakdown

### Main Dashboard (Mission Control)
- **Header**: “Mission Control” + subtitle with date.
- **Grid**: Three columns. Column 1: Today (timeline), School (assignments + classes + study suggestions), Work (hours, income, shifts). Column 2: Projects (2×2 project cards), Tasks (checklist + today/upcoming/overdue), Calendar (mini week grid). Column 3: Finance (income/spending/remaining + bills), AI Planner (suggested schedule + study tip + focus blocks).

### School Page
- **Sections**: Assignments (cards with title, course, due, progress bar, priority badge), Lecture schedule (list with room and time), Study planner (suggestions + important links).

### Projects Page
- **Sections**: Project overview (progress, tasks left, notes count), Task board (kanban: To Do, In Progress, Done with draggable-style cards), Notes / Files / AI interactions (placeholder cards).

### Tasks Page
- **Views**: List (Today / Upcoming / Overdue in separate cards), Kanban (three columns placeholder), Calendar (placeholder). Toggle above content.

### Calendar Page
- **Views**: Day (list of events for one day, color by category), Week (7-day grid with events), Month (grid of days). Legend for School / Work / Personal / Projects. Toggle above content.

### Other routes (Work, Finances, Notes, AI Agents, Automation, Settings)
- **Placeholder**: Title, short subtitle, and a single “Placeholder — no backend logic” message for consistent shell.

---

## Tech Stack (UI only)

- **React 18** + **Vite** for build and dev server.
- **React Router v6** for client-side routing.
- **Tailwind CSS** for layout and styling (custom theme: surface colors, accent colors, card shadows).
- **No backend**: All data from `mockData.js`.

Run: `npm install` then `npm run dev` to open the dashboard in the browser.
