import Card from '../components/ui/Card'
import { schoolData, schoolAssignmentsPage } from '../data/mockData'

export default function School() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">School</h1>
        <p className="text-surface-500 text-sm mt-0.5">Assignments, schedule & study planner</p>
      </div>

      {/* Assignments — cards with deadlines and progress */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schoolAssignmentsPage.map((a, i) => (
            <div
              key={i}
              className="rounded-xl bg-white border border-surface-200/80 shadow-card p-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-surface-800">{a.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    a.priority === 'high' ? 'bg-red-100 text-red-700' : a.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-surface-600'
                  }`}
                >
                  {a.priority}
                </span>
              </div>
              <p className="text-sm text-surface-500 mb-3">{a.course} · Due {a.due}</p>
              <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-violet rounded-full transition-all"
                  style={{ width: `${a.progress}%` }}
                />
              </div>
              <p className="text-xs text-surface-500 mt-2">{a.progress}% complete</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecture schedule */}
        <Card title="Lecture schedule" subtitle="This week">
          <ul className="space-y-3">
            {schoolData.classes.map((c, i) => (
              <li key={i} className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0">
                <div>
                  <p className="font-medium text-surface-800">{c.name}</p>
                  <p className="text-sm text-surface-500">{c.room}</p>
                </div>
                <span className="text-sm font-mono text-surface-600">{c.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Study planner / Important links */}
        <Card title="Study planner" subtitle="Suggestions">
          <ul className="space-y-2 mb-4">
            {schoolData.studySuggestions.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-surface-700">
                <span className="w-2 h-2 rounded-full bg-accent-amber" />
                {s}
              </li>
            ))}
          </ul>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Important links</h4>
          <ul className="space-y-1.5 text-sm">
            <li><a href="#" className="text-accent-indigo hover:underline">LMS · Course materials</a></li>
            <li><a href="#" className="text-accent-indigo hover:underline">Library portal</a></li>
            <li><a href="#" className="text-accent-indigo hover:underline">Office hours signup</a></li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
