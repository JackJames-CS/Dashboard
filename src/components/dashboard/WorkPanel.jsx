import Card from '../ui/Card'
import { workData } from '../../data/mockData'

export default function WorkPanel() {
  return (
    <Card title="Work" subtitle="Shifts & earnings">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-50 p-3 text-center">
            <p className="text-2xl font-semibold text-surface-800">{workData.hoursThisWeek}h</p>
            <p className="text-xs text-surface-500">This week</p>
          </div>
          <div className="rounded-lg bg-accent-emerald/10 p-3 text-center">
            <p className="text-2xl font-semibold text-accent-emerald">${workData.estimatedIncome}</p>
            <p className="text-xs text-surface-500">Est. income</p>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upcoming shifts</h4>
          <ul className="space-y-2">
            {workData.shifts.map((s, i) => (
              <li key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-surface-100 last:border-0">
                <span className="font-medium text-surface-700">{s.day}</span>
                <span className="text-surface-500">{s.time}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue">{s.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
