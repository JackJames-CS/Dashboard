import Card from '../ui/Card'
import { tasksData } from '../../data/mockData'

export default function TasksPanel() {
  return (
    <Card title="Tasks" subtitle="Today & upcoming" action={<a href="/tasks" className="text-xs font-medium text-accent-indigo hover:underline">View all</a>}>
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Today</h4>
          <ul className="space-y-1.5">
            {tasksData.today.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked={t.done} className="rounded border-surface-300 text-accent-indigo" />
                <span className={t.done ? 'text-surface-400 line-through' : 'text-surface-700'}>{t.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Upcoming</h4>
            <p className="text-sm text-surface-600">{tasksData.upcoming.length} tasks</p>
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Overdue</h4>
            <p className="text-sm text-red-600">{tasksData.overdue.length} tasks</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
