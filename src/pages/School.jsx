import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useSchoolAssignments } from '../hooks/useSchoolAssignments'
import { useSchoolModules, classify } from '../hooks/useSchoolModules'
import { schoolData, schoolLinks, defaultModules } from '../data/mockData'

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

// ── Timetable ─────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const MODULE_COLORS = {
  CS211: 'bg-accent-indigo/15 text-accent-indigo border-accent-indigo/20',
  CS230: 'bg-accent-violet/15 text-accent-violet border-accent-violet/20',
  CS240: 'bg-accent-blue/15 text-accent-blue border-accent-blue/20',
  CS280: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20',
  CS335: 'bg-accent-amber/15 text-accent-amber border-accent-amber/20',
  CS355: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/15',
}

function getModuleColor(name) {
  const code = Object.keys(MODULE_COLORS).find(k => name === k)
  return code ? MODULE_COLORS[code] : 'bg-surface-300/40 text-surface-600 border-surface-300/30'
}

function Timetable({ classes }) {
  const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = classes.filter(c => c.day === d)
    return acc
  }, {})

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {DAYS.map(day => (
        <div key={day} className={`rounded-xl border p-3 space-y-2 min-w-0 ${day === today ? 'border-accent-violet/40 bg-accent-violet/5' : 'border-surface-300/50 bg-surface-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold tracking-wide uppercase ${day === today ? 'text-accent-violet' : 'text-surface-500'}`}>{day}</span>
            {day === today && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-violet/20 text-accent-violet font-semibold">Today</span>}
          </div>
          {byDay[day].length === 0 ? (
            <p className="text-xs text-surface-400 italic">Free</p>
          ) : (
            byDay[day].map((c, i) => (
              <div key={i} className={`rounded-lg border px-2 py-1.5 min-w-0 overflow-hidden ${getModuleColor(c.name)}`}>
                <p className="text-xs font-bold leading-tight">{c.name}</p>
                <p className="text-[11px] leading-tight opacity-75">{c.label}</p>
                <p className="text-[11px] font-mono mt-0.5 opacity-70">{c.time}</p>
                {c.room && <p className="text-[11px] opacity-50 truncate">{c.room}</p>}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function School() {
  const { assignments, loading: aLoading, error: aError, addAssignment, updateProgress, deleteAssignment } = useSchoolAssignments()
  const { modules, qca, loading: mLoading, error: mError, addModule, updateModule, deleteModule } = useSchoolModules()

  const [showAddModule, setShowAddModule] = useState(false)
  const [seeding, setSeeding] = useState(false)

  async function handleSeedModules() {
    setSeeding(true)
    for (const mod of defaultModules) {
      await addModule(mod)
    }
    setSeeding(false)
  }
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
          <div className="flex gap-2">
            {modules.length === 0 && (
              <button
                onClick={handleSeedModules}
                disabled={seeding}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-300 text-surface-700 text-sm font-medium hover:bg-surface-400 transition-colors disabled:opacity-60"
              >
                {seeding ? 'Adding…' : 'Load from calendar'}
              </button>
            )}
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

      {/* ── Timetable ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-surface-800">Weekly Schedule</h2>
        <Timetable classes={schoolData.classes} />
      </section>
    </div>
  )
}
