import TodayPanel from '../components/dashboard/TodayPanel'
import SchoolPanel from '../components/dashboard/SchoolPanel'
import WorkPanel from '../components/dashboard/WorkPanel'
import ProjectsPanel from '../components/dashboard/ProjectsPanel'
import TasksPanel from '../components/dashboard/TasksPanel'
import CalendarPreview from '../components/dashboard/CalendarPreview'
import FinanceSnapshot from '../components/dashboard/FinanceSnapshot'
import AIPlannerPanel from '../components/dashboard/AIPlannerPanel'

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Mission Control</h1>
          <p className="text-surface-500 text-sm mt-0.5">Your personal command center · Friday, Mar 6</p>
        </div>
      </div>

      {/* Google Search */}
      <form action="https://www.google.com/search" method="get" className="max-w-2xl">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-200 border border-surface-300/50 focus-within:border-accent-blue/50 focus-within:ring-1 focus-within:ring-accent-blue/20 transition-all shadow-card">
          <svg className="w-5 h-5 text-surface-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            name="q"
            placeholder="Search Google..."
            className="flex-1 bg-transparent text-sm text-surface-800 placeholder:text-surface-500 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-surface-300 text-surface-500 text-xs font-mono">↵</kbd>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Today + School + Work */}
        <div className="space-y-6">
          <TodayPanel />
          <SchoolPanel />
          <WorkPanel />
        </div>

        {/* Center column — Projects + Tasks + Calendar */}
        <div className="space-y-6">
          <ProjectsPanel />
          <TasksPanel />
          <CalendarPreview />
        </div>

        {/* Right column — Finance + AI Planner */}
        <div className="space-y-6">
          <FinanceSnapshot />
          <AIPlannerPanel />
        </div>
      </div>
    </div>
  )
}
