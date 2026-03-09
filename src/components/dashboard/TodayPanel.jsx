import Card from '../ui/Card'
import DataState from '../ui/DataState'
import { useSchedule } from '../../hooks/useSchedule'
import { schoolData, getUpcomingDeadlines } from '../../data/mockData'

const typeColors = {
  work:     'bg-accent-blue/15 text-accent-blue',
  school:   'bg-accent-violet/15 text-accent-violet',
  personal: 'bg-accent-emerald/15 text-accent-emerald',
  deadline: 'bg-red-900/40 text-red-400',
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function todayClasses() {
  const today = DAY_NAMES[new Date().getDay()]
  return schoolData.classes
    .filter(c => c.day === today)
    .map(c => ({
      id: `class-${c.name}-${c.time}`,
      time: c.time.split('–')[0],
      title: `${c.name} — ${c.label}`,
      subtitle: c.room || null,
      type: 'school',
      duration: null,
    }))
}

export default function TodayPanel() {
  const { schedule, loading, error } = useSchedule()
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-IE', { weekday: 'long', month: 'short', day: 'numeric' })

  const classes = todayClasses()
  const todayDeadlines = getUpcomingDeadlines()
    .filter(d => {
      const due = new Date(d.due)
      const today = now
      return due.getFullYear() === today.getFullYear() &&
             due.getMonth() === today.getMonth() &&
             due.getDate() === today.getDate()
    })
    .map(d => ({
      id: `deadline-${d.due}`,
      time: new Date(d.due).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false }),
      title: d.title,
      subtitle: 'Deadline',
      type: 'deadline',
      duration: null,
    }))
  const combined = [...schedule, ...classes, ...todayDeadlines].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <Card title="Today" subtitle={dateLabel}>
      <DataState loading={loading} error={error}>
        <div className="space-y-2">
          {combined.length === 0 && (
            <p className="text-sm text-surface-500 text-center py-4">Nothing scheduled</p>
          )}
          {combined.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <span className="text-xs font-mono text-surface-500 shrink-0 w-10">{item.time}</span>
              <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${typeColors[item.type] || 'bg-surface-100 text-surface-600'}`}>
                  {item.type}
                </span>
                <p className="text-sm font-medium text-surface-800">{item.title}</p>
                {item.subtitle && <p className="text-xs text-surface-500">{item.subtitle}</p>}
                {item.duration && <p className="text-xs text-surface-500">{item.duration} min</p>}
              </div>
            </div>
          ))}
        </div>
      </DataState>
    </Card>
  )
}
