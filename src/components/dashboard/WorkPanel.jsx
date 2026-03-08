import Card from '../ui/Card'
import DataState from '../ui/DataState'
import { useWork } from '../../hooks/useWork'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function WorkPanel() {
  const { upcomingShifts, settings, loading, error, hoursThisWeek, earningsThisWeek } = useWork()
  const nextShifts = upcomingShifts.slice(0, 3)

  return (
    <Card title="Work" subtitle="Shifts & earnings">
      <DataState loading={loading} error={error}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-50 p-3 text-center">
              <p className="text-2xl font-semibold text-surface-800">{hoursThisWeek.toFixed(1)}h</p>
              <p className="text-xs text-surface-500">This week</p>
            </div>
            <div className="rounded-lg bg-accent-emerald/10 p-3 text-center">
              <p className="text-2xl font-semibold text-accent-emerald">
                {settings.currency}{earningsThisWeek.toFixed(0)}
              </p>
              <p className="text-xs text-surface-500">Est. income</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upcoming shifts</h4>
            {nextShifts.length === 0 ? (
              <p className="text-xs text-surface-400">No upcoming shifts.</p>
            ) : (
              <ul className="space-y-2">
                {nextShifts.map((s) => (
                  <li key={s.id} className="flex justify-between items-center text-sm py-1.5 border-b border-surface-100 last:border-0">
                    <span className="font-medium text-surface-700">{formatDate(s.shift_date)}</span>
                    <span className="text-surface-500">{s.start_time}–{s.end_time}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue">{s.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DataState>
    </Card>
  )
}
