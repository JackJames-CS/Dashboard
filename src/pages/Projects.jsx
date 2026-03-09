import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataState from '../components/ui/DataState'
import { useProjects } from '../hooks/useProjects'
import { useKanban, calcWeightedProgress } from '../hooks/useKanban'

const colorMap = {
  blue: 'bg-accent-blue',
  violet: 'bg-accent-violet',
  emerald: 'bg-accent-emerald',
  amber: 'bg-accent-amber',
}

const colorBorder = {
  blue: 'hover:border-accent-blue/60',
  violet: 'hover:border-accent-violet/60',
  emerald: 'hover:border-accent-emerald/60',
  amber: 'hover:border-accent-amber/60',
}

const PRIORITY_BADGE = {
  high:   'bg-red-500/15 text-red-400 border-red-500/20',
  medium: 'bg-accent-amber/15 text-accent-amber border-accent-amber/20',
  low:    'bg-surface-300 text-surface-500 border-surface-400/20',
}

const COLORS = ['blue', 'violet', 'emerald', 'amber']
const PRIORITIES = ['high', 'medium', 'low']

export default function Projects() {
  const navigate = useNavigate()
  const { projects, loading, error, createProject, deleteProject } = useProjects()
  const { kanbanColumns } = useKanban()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('blue')
  const [priority, setPriority] = useState('medium')
  const [saving, setSaving] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await createProject({ name: name.trim(), color, priority })
    setName('')
    setColor('blue')
    setPriority('medium')
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Projects</h1>
          <p className="text-surface-500 text-sm mt-0.5">Click a project to open it</p>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          className="px-4 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 transition-colors shrink-0"
        >
          {showForm ? 'Cancel' : 'New project'}
        </button>
      </div>

      {/* New project form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-surface-200 border border-surface-300/50"
        >
          {/* Name */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-surface-500 mb-1 block">Project name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Portfolio site"
              className="w-full px-3 py-2 rounded-lg border border-surface-300 bg-surface-100 text-sm text-surface-800 placeholder:text-surface-400 outline-none focus:ring-1 focus:ring-accent-indigo"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-surface-500 mb-1 block">Colour</label>
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full ${colorMap[c]} ring-offset-1 ring-offset-surface-200 transition-all ${color === c ? 'ring-2 ring-white/70' : 'opacity-40 hover:opacity-70'}`}
                />
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-surface-500 mb-1 block">Priority</label>
            <div className="flex gap-1">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border capitalize font-medium transition-all ${
                    priority === p ? PRIORITY_BADGE[p] : 'border-surface-300/50 text-surface-400 hover:border-surface-400 hover:text-surface-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-4 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </form>
      )}

      <DataState loading={loading} error={error}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => {
            const allTasks = kanbanColumns.flatMap(c => c.tasks).filter(t => t.project === p.name)
            const doneTasks = kanbanColumns.find(c => c.id === 'done')?.tasks.filter(t => t.project === p.name) ?? []
            const progress = calcWeightedProgress(kanbanColumns, p.name)
            const tasksLeft = allTasks.length - doneTasks.length

            return (
              <div key={p.id} className="group relative">
                <button
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className={`w-full text-left rounded-xl bg-surface-200 border border-surface-300/50 shadow-card p-5 hover:shadow-card-hover transition-all ${colorBorder[p.color] || 'hover:border-surface-400/60'}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${colorMap[p.color] || 'bg-surface-400'}`} />
                      <span className="text-base font-semibold text-surface-800 truncate">{p.name}</span>
                    </div>
                    <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${PRIORITY_BADGE[p.priority] || PRIORITY_BADGE.medium}`}>
                      {p.priority}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${colorMap[p.color] || 'bg-surface-400'}`}
                      style={{ width: `${progress ?? 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-surface-500">
                    <span>{progress !== null ? `${progress}% done` : 'No tasks'}</span>
                    <span>{allTasks.length > 0 ? `${tasksLeft} left` : ''}</span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{p.lastActivity}</p>
                </button>

                <button
                  onClick={() => deleteProject(p.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-surface-400 hover:text-red-400 hover:bg-surface-300 transition-all"
                  title="Delete project"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      </DataState>
    </div>
  )
}
