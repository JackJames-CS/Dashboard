import Card from '../ui/Card'
import DataState from '../ui/DataState'
import { useSchoolAssignments } from '../../hooks/useSchoolAssignments'
import { useDeadlines } from '../../hooks/useDeadlines'
import { schoolData, getUpcomingDeadlines, deadlineUrgency } from '../../data/mockData'

const URGENCY_STYLES = {
  today:     'bg-red-900/40 text-red-400',
  tomorrow:  'bg-amber-900/40 text-amber-400',
  'this week': 'bg-accent-blue/20 text-accent-blue',
  later:     'bg-surface-300 text-surface-500',
}

export default function SchoolPanel() {
  const { assignments, loading, error } = useSchoolAssignments()
  const { deadlines } = useDeadlines()
  const upcomingDeadlines = getUpcomingDeadlines(deadlines, 3)

  return (
    <Card title="School" subtitle="Upcoming & schedule" action={<a href="/school" className="text-xs font-medium text-accent-indigo hover:underline">View all</a>}>
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Deadlines</h4>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-xs text-surface-400 italic">No upcoming deadlines</p>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.map((d, i) => {
                const urgency = deadlineUrgency(d.due)
                return (
                  <li key={i} className="rounded-lg bg-surface-50 p-2.5">
                    <p className="text-sm font-medium text-surface-800 truncate">{d.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${URGENCY_STYLES[urgency]}`}>
                        {urgency}
                      </span>
                      <span className="text-xs text-surface-500">
                        {new Date(d.due).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Assignments</h4>
          <DataState loading={loading} error={error}>
            <ul className="space-y-2">
              {assignments.slice(0, 2).map((a) => (
                <li key={a.id} className="rounded-lg bg-surface-50 p-2.5">
                  <p className="text-sm font-medium text-surface-800 truncate">{a.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-surface-500">Due {a.due}</span>
                    <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-violet rounded-full" style={{ width: `${a.progress}%` }} />
                    </div>
                  </div>
                </li>
              ))}
              {assignments.length === 0 && !loading && (
                <p className="text-xs text-surface-400 italic">No assignments added yet</p>
              )}
            </ul>
          </DataState>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Today's classes</h4>
          <ul className="space-y-1.5">
            {schoolData.classes
              .filter(c => c.day === ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()])
              .slice(0, 3)
              .map((c, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-surface-700">{c.name} — {c.label}</span>
                  <span className="text-surface-500 text-xs">{c.time}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
