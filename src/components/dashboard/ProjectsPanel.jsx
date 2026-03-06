import Card from '../ui/Card'
import { projectsData } from '../../data/mockData'

const colorMap = { blue: 'bg-accent-blue', violet: 'bg-accent-violet', emerald: 'bg-accent-emerald', amber: 'bg-accent-amber' }

export default function ProjectsPanel() {
  return (
    <Card title="Projects" subtitle="Active" action={<a href="/projects" className="text-xs font-medium text-accent-indigo hover:underline">View all</a>}>
      <div className="grid grid-cols-2 gap-3">
        {projectsData.map((p, i) => (
          <div key={i} className="rounded-lg border border-surface-200/80 p-3 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${colorMap[p.color] || 'bg-surface-400'}`} />
              <span className="text-sm font-medium text-surface-800 truncate">{p.name}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full ${colorMap[p.color] || 'bg-surface-400'}`} style={{ width: `${p.progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-surface-500">
              <span>{p.tasksLeft} tasks left</span>
              <span>{p.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
