import Card from '../ui/Card'
import { schoolData } from '../../data/mockData'

export default function SchoolPanel() {
  return (
    <Card title="School" subtitle="Upcoming & schedule" action={<a href="/school" className="text-xs font-medium text-accent-indigo hover:underline">View all</a>}>
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upcoming assignments</h4>
          <ul className="space-y-2">
            {schoolData.assignments.slice(0, 2).map((a, i) => (
              <li key={i} className="rounded-lg bg-surface-50 p-2.5">
                <p className="text-sm font-medium text-surface-800 truncate">{a.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-surface-500">Due {a.due}</span>
                  <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-violet rounded-full" style={{ width: `${a.progress}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Today's classes</h4>
          <ul className="space-y-1.5">
            {schoolData.classes.slice(0, 2).map((c, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-surface-700">{c.name}</span>
                <span className="text-surface-500 text-xs">{c.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Study suggestions</h4>
          <ul className="space-y-1">
            {schoolData.studySuggestions.map((s, i) => (
              <li key={i} className="text-sm text-surface-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
