import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useSchoolAssignments } from '../hooks/useSchoolAssignments'
import { schoolData, schoolLinks } from '../data/mockData'

const accentMap = {
  amber: 'bg-accent-amber/20 text-accent-amber',
  blue: 'bg-accent-blue/20 text-accent-blue',
  indigo: 'bg-accent-indigo/20 text-accent-indigo',
  emerald: 'bg-accent-emerald/20 text-accent-emerald',
  violet: 'bg-accent-violet/20 text-accent-violet',
}

export default function School() {
  const { assignments, loading, error } = useSchoolAssignments()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">School</h1>
        <p className="text-surface-500 text-sm mt-0.5">Assignments, schedule & study planner</p>
      </div>

      {/* Assignments */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Assignments</h2>
        <DataState loading={loading} error={error}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="rounded-xl bg-surface-200 border border-surface-300/50 shadow-card p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-surface-800">{a.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.priority === 'high'
                        ? 'bg-red-900/40 text-red-400'
                        : a.priority === 'medium'
                        ? 'bg-amber-900/40 text-amber-400'
                        : 'bg-surface-300 text-surface-500'
                    }`}
                  >
                    {a.priority}
                  </span>
                </div>
                <p className="text-sm text-surface-500 mb-3">{a.course} · Due {a.due}</p>
                <div className="w-full h-2 bg-surface-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-violet rounded-full transition-all"
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
                <p className="text-xs text-surface-500 mt-2">{a.progress}% complete</p>
              </div>
            ))}
          </div>
        </DataState>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {schoolLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-200 border border-surface-300/50 hover:bg-surface-300 hover:border-accent-indigo/30 transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${accentMap[link.accent]}`}>
                {link.label.charAt(0)}
              </div>
              <span className="text-xs font-medium text-surface-700 text-center leading-tight">{link.label}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecture schedule */}
        <Card title="Lecture schedule" subtitle="This week">
          <ul className="space-y-3">
            {schoolData.classes.map((c, i) => (
              <li key={i} className="flex justify-between items-center py-2 border-b border-surface-300/40 last:border-0">
                <div>
                  <p className="font-medium text-surface-800">{c.name}</p>
                  <p className="text-sm text-surface-500">{c.room}</p>
                </div>
                <span className="text-sm font-mono text-surface-600">{c.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Study planner */}
        <Card title="Study planner" subtitle="Suggestions">
          <ul className="space-y-2">
            {schoolData.studySuggestions.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-surface-700">
                <span className="w-2 h-2 rounded-full bg-accent-amber shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
