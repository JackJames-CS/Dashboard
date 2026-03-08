import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useSchoolAssignments } from '../hooks/useSchoolAssignments'
import { useSchoolModules, classify } from '../hooks/useSchoolModules'
import { schoolData, schoolLinks } from '../data/mockData'

const ACCENT_MAP = {
  amber:  'bg-accent-amber/20 text-accent-amber',
  blue:   'bg-accent-blue/20 text-accent-blue',
  indigo: 'bg-accent-indigo/20 text-accent-indigo',
  emerald:'bg-accent-emerald/20 text-accent-emerald',
  violet: 'bg-accent-violet/20 text-accent-violet',
}
const COLOR_OPTIONS = ['indigo', 'violet', 'blue', 'emerald', 'amber']

// ── Grade bar ─────────────────────────────────────────────────
function GradeBar({ value, max = 100, color = 'bg-accent-violet' }) {
  return (
    <div className="w-full h-2 bg-surface-300 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  )
}

// ── Classification badge ───────────────────────────────────────
function ClassBadge({ pct }) {
  const cls = classify(pct)
  if (!cls) return null
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls.bg} ${cls.color}`}>
      {cls.label}
    </span>
  )
}

// ── Module card ───────────────────────────────────────────────
function ModuleCard({ mod, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [examMark, setExamMark] = useState(mod.exam_mark ?? '')
  const [caMark, setCaMark] = useState(mod.ca_mark ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onUpdate(mod.id, {
      exam_mark: examMark !== '' ? Number(examMark) : null,
      ca_mark:   caMark   !== '' ? Number(caMark)   : null,
    })
    setSaving(false)
    setEditing(false)
  }

  const cls = classify(mod.overall)
  const gradeBarColor =
    mod.overall >= 70 ? 'bg-accent-amber' :
    mod.overall >= 60 ? 'bg-accent-emerald' :
    mod.overall >= 50 ? 'bg-accent-blue' :
    mod.overall >= 40 ? 'bg-surface-500' : 'bg-red-500'

  return (
    <div className="rounded-xl bg-surface-200 border border-surface-300/50 shadow-card p-4 space-y-3 group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${ACCENT_MAP[mod.color].split(' ')[0]}`} />
            <h3 className="font-semibold text-surface-800">{mod.name}</h3>
          </div>
          <p className="text-xs text-surface-500 mt-0.5">{mod.credits} credits · {mod.exam_weight}% exam / {mod.caWeight}% CA</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(e => !e)}
            className="p-1 rounded text-surface-500 hover:text-surface-800 transition-colors"
            title="Edit marks"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(mod.id)}
            className="p-1 rounded text-surface-500 hover:text-red-400 transition-colors"
            title="Delete module"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Marks */}
      {!editing ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-surface-500">
            <span>CA ({mod.caWeight}%): {mod.ca_mark != null ? `${mod.ca_mark}%` : '—'}</span>
            <span>Exam ({mod.exam_weight}%): {mod.exam_mark != null ? `${mod.exam_mark}%` : '—'}</span>
          </div>
          {mod.overall != null ? (
            <>
              <GradeBar value={mod.overall} color={gradeBarColor} />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-surface-700">{mod.overall.toFixed(1)}%</span>
                <ClassBadge pct={mod.overall} />
              </div>
            </>
          ) : (
            <p className="text-xs text-surface-400 italic">
              {mod.ca_mark != null || mod.exam_mark != null ? 'Awaiting remaining mark' : 'No marks entered yet'}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {mod.caWeight > 0 && (
              <div>
                <label className="text-xs text-surface-500 mb-1 block">CA mark (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={caMark}
                  onChange={e => setCaMark(e.target.value)}
                  placeholder="e.g. 85"
                  className="w-full px-2 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-sm text-surface-800 outline-none focus:ring-1 focus:ring-accent-indigo"
                />
              </div>
            )}
            {mod.exam_weight > 0 && (
              <div>
                <label className="text-xs text-surface-500 mb-1 block">Exam mark (%)</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={examMark}
                  onChange={e => setExamMark(e.target.value)}
                  placeholder="e.g. 72"
                  className="w-full px-2 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-sm text-surface-800 outline-none focus:ring-1 focus:ring-accent-indigo"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="flex-1 py-1.5 rounded-md bg-accent-indigo text-white text-xs font-medium disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 py-1.5 rounded-md bg-surface-300 text-surface-700 text-xs font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add module form ───────────────────────────────────────────
function AddModuleForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('5')
  const [examWeight, setExamWeight] = useState('60')
  const [color, setColor] = useState('indigo')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onAdd({ name: name.trim(), credits: Number(credits), exam_weight: Number(examWeight), color })
    setSaving(false)
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-surface-200 border border-surface-300/50 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-surface-800">Add module</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-surface-500 mb-1 block">Module name</label>
          <input
            autoFocus value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. CS 301 — Algorithms"
            className="w-full px-3 py-2 rounded-lg border border-surface-300 bg-surface-100 text-sm text-surface-800 outline-none focus:ring-1 focus:ring-accent-indigo placeholder:text-surface-400"
          />
        </div>
        <div>
          <label className="text-xs text-surface-500 mb-1 block">Credits</label>
          <input
            type="number" min="1" max="30" step="0.5"
            value={credits} onChange={e => setCredits(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-300 bg-surface-100 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
          />
        </div>
        <div>
          <label className="text-xs text-surface-500 mb-1 block">Exam weight (%)</label>
          <input
            type="number" min="0" max="100" step="5"
            value={examWeight} onChange={e => setExamWeight(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-surface-300 bg-surface-100 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
          />
          <p className="text-xs text-surface-400 mt-1">CA = {100 - Number(examWeight)}%</p>
        </div>
        <div>
          <label className="text-xs text-surface-500 mb-1 block">Colour</label>
          <div className="flex gap-2 mt-1">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c} type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full ${ACCENT_MAP[c].split(' ')[0]} ring-offset-1 ring-offset-surface-200 ${color === c ? 'ring-2 ring-accent-indigo' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving || !name.trim()} className="flex-1 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium disabled:opacity-60">
          {saving ? 'Adding…' : 'Add module'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg bg-surface-300 text-surface-700 text-sm font-medium">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function School() {
  const { assignments, loading: aLoading, error: aError, addAssignment, updateProgress, deleteAssignment } = useSchoolAssignments()
  const { modules, qca, loading: mLoading, error: mError, addModule, updateModule, deleteModule } = useSchoolModules()

  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCourse, setNewCourse] = useState('')
  const [newDue, setNewDue] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [addingAssignment, setAddingAssignment] = useState(false)

  const cls = classify(qca)

  async function handleAddAssignment(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAddingAssignment(true)
    await addAssignment({ title: newTitle.trim(), course: newCourse.trim(), due: newDue, priority: newPriority, progress: 0 })
    setNewTitle(''); setNewCourse(''); setNewDue(''); setNewPriority('medium')
    setAddingAssignment(false)
    setShowAddAssignment(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">School</h1>
          <p className="text-surface-500 text-sm mt-0.5">Grades, assignments & schedule</p>
        </div>
        {qca != null && cls && (
          <div className={`text-right px-3 py-2 rounded-xl border ${cls.bg}`}>
            <p className={`text-2xl font-bold ${cls.color}`}>{qca.toFixed(1)}%</p>
            <p className={`text-xs font-semibold ${cls.color}`}>{cls.label}</p>
          </div>
        )}
      </div>

      {/* ── Modules / Grades ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-surface-800">Modules</h2>
            <p className="text-xs text-surface-500">
              {modules.filter(m => m.overall != null).length} of {modules.length} graded
            </p>
          </div>
          <button
            onClick={() => setShowAddModule(a => !a)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-violet/20 text-accent-violet text-sm font-medium hover:bg-accent-violet/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add module
          </button>
        </div>

        <DataState loading={mLoading} error={mError}>
          {showAddModule && (
            <AddModuleForm onAdd={addModule} onCancel={() => setShowAddModule(false)} />
          )}
          {modules.length === 0 && !showAddModule ? (
            <p className="text-surface-500 text-sm text-center py-8">No modules yet — add your first one above</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(m => (
                <ModuleCard key={m.id} mod={m} onUpdate={updateModule} onDelete={deleteModule} />
              ))}
            </div>
          )}
        </DataState>
      </section>

      {/* ── Assignments & Projects ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-800">Assignments & Projects</h2>
          <button
            onClick={() => setShowAddAssignment(a => !a)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-violet/20 text-accent-violet text-sm font-medium hover:bg-accent-violet/30 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        {showAddAssignment && (
          <form onSubmit={handleAddAssignment} className="flex flex-wrap gap-2 p-4 rounded-xl bg-surface-200 border border-surface-300/50">
            <input
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="Title…"
              className="flex-1 min-w-[140px] rounded-lg border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 outline-none focus:ring-1 focus:ring-accent-indigo"
            />
            <input
              value={newCourse} onChange={e => setNewCourse(e.target.value)}
              placeholder="Course (e.g. CS 301)"
              className="rounded-lg border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
            />
            <input
              type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
              className="rounded-lg border border-surface-300 bg-surface-100 px-2 py-2 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
            />
            <select
              value={newPriority} onChange={e => setNewPriority(e.target.value)}
              className="rounded-lg border border-surface-300 bg-surface-100 px-2 py-2 text-sm text-surface-700 outline-none"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <button type="submit" disabled={addingAssignment || !newTitle.trim()} className="px-4 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium disabled:opacity-60">
              {addingAssignment ? 'Adding…' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowAddAssignment(false)} className="px-3 py-2 rounded-lg bg-surface-300 text-surface-700 text-sm">
              Cancel
            </button>
          </form>
        )}

        <DataState loading={aLoading} error={aError}>
          {assignments.length === 0 ? (
            <p className="text-surface-500 text-sm text-center py-8">No assignments yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map(a => (
                <div key={a.id} className="group rounded-xl bg-surface-200 border border-surface-300/50 shadow-card p-4 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-surface-800">{a.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.priority === 'high' ? 'bg-red-900/40 text-red-400' :
                        a.priority === 'medium' ? 'bg-amber-900/40 text-amber-400' :
                        'bg-surface-300 text-surface-500'
                      }`}>
                        {a.priority}
                      </span>
                      <button
                        onClick={() => deleteAssignment(a.id)}
                        className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-400 transition-all"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-surface-500 mb-3">{a.course}{a.due ? ` · Due ${a.due}` : ''}</p>
                  <GradeBar value={a.progress} color="bg-accent-violet" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-surface-500">{a.progress}% complete</p>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={a.progress}
                      onChange={e => updateProgress(a.id, Number(e.target.value))}
                      className="w-24 accent-violet-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </DataState>
      </section>

      {/* ── Quick Links ── */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {schoolLinks.map((link, i) => (
            <a
              key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-200 border border-surface-300/50 hover:bg-surface-300 hover:border-accent-indigo/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${ACCENT_MAP[link.accent]}`}>
                {link.label.charAt(0)}
              </div>
              <span className="text-xs font-medium text-surface-700 text-center leading-tight">{link.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Timetable + Study planner ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Lecture & lab schedule" subtitle="This week">
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
