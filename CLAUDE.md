# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:5173/Dashboard/)
npm run build     # Production build
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

**Stack**: React 18 + Vite, React Router v6, Tailwind CSS. No backend — all data lives in `src/data/mockData.js`.

**Vite base path**: `/Dashboard/` (configured for GitHub Pages deployment at `/<repo-name>/`).

**Layout shell** (`src/components/Layout.jsx`):
- `TopNav` (fixed, 56px)
- `Sidebar` (fixed, 240px) — navigation links to all routes
- `<main>` — React Router `<Outlet>` renders the active page
- `RightPanel` (fixed, 320px) — quick tools area

**Routing** (`src/App.jsx`): All routes nest under `Layout`. Fully implemented pages: `Dashboard`, `School`, `Projects`, `Tasks`, `Calendar`. Other routes (`work`, `finances`, `notes`, `automation`, `settings`) render the `Placeholder` component.

**Component structure**:
- `src/components/ui/Card.jsx` — base card used everywhere (title, subtitle, action slot, children)
- `src/components/dashboard/` — one component per dashboard widget (TodayPanel, SchoolPanel, WorkPanel, ProjectsPanel, TasksPanel, CalendarPreview, FinanceSnapshot, AIPlannerPanel)
- `src/pages/` — full-page views

**Tailwind theme** (`tailwind.config.js`):
- `surface-*` colors are a dark palette (surface-50 is darkest `#0f172a`, surface-900 is lightest `#f8fafc`) — inverted from typical Tailwind convention
- `accent.*` colors: `blue`, `indigo`, `violet`, `emerald`, `amber`
- Category color coding: School = violet, Work = blue, Personal = emerald, Projects = amber
- Custom shadows: `shadow-card`, `shadow-card-hover`, `shadow-panel`
- Fonts: `font-sans` = Inter, `font-mono` = JetBrains Mono

**Adding a new page**: Create the component in `src/pages/`, add a `<Route>` in `App.jsx`, and add a nav link in `Sidebar.jsx`.

**Adding mock data**: All data is in `src/data/mockData.js`. No API calls or state persistence exist.
