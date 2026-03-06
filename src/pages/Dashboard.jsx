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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Mission Control</h1>
        <p className="text-surface-500 text-sm mt-0.5">Your personal command center · Thursday, Mar 5</p>
      </div>

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
