import Card from '../ui/Card'
import { calendarWeekEvents } from '../../data/mockData'

export default function CalendarPreview() {
  const today = 5
  return (
    <Card title="Calendar" subtitle="This week" action={<a href="/calendar" className="text-xs font-medium text-accent-indigo hover:underline">Open</a>}>
      <div className="grid grid-cols-7 gap-1">
        {calendarWeekEvents.map((d) => (
          <div
            key={d.day}
            className={`rounded-lg p-2 text-center ${
              d.date === today ? 'bg-accent-indigo/15 ring-1 ring-accent-indigo/30' : 'bg-surface-50'
            }`}
          >
            <p className="text-xs font-medium text-surface-500">{d.day}</p>
            <p className={`text-sm font-semibold ${d.date === today ? 'text-accent-indigo' : 'text-surface-700'}`}>{d.date}</p>
            <p className="text-xs text-surface-500">{d.events} events</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
