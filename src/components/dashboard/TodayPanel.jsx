import Card from '../ui/Card'
import { todaySchedule } from '../../data/mockData'

const typeColors = { work: 'bg-accent-blue/15 text-accent-blue', school: 'bg-accent-violet/15 text-accent-violet', personal: 'bg-accent-emerald/15 text-accent-emerald' }

export default function TodayPanel() {
  return (
    <Card title="Today" subtitle="Thursday, Mar 5">
      <div className="space-y-2">
        {todaySchedule.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-xs font-mono text-surface-500 shrink-0 w-10">{item.time}</span>
            <div className="flex-1 min-w-0">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${typeColors[item.type] || 'bg-surface-100 text-surface-600'}`}>
                {item.type}
              </span>
              <p className="text-sm font-medium text-surface-800">{item.title}</p>
              <p className="text-xs text-surface-500">{item.duration} min</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
