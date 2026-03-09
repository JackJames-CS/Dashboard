import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DataState from '../components/ui/DataState'
import { useProjects } from '../hooks/useProjects'
import { useKanban, calcWeightedProgress, PRIORITY_WEIGHTS } from '../hooks/useKanban'

const colorMap = {
  blue: 'bg-accent-blue',
  violet: 'bg-accent-violet',
  emerald: 'bg-accent-emerald',
  amber: 'bg-accent-amber',
}

const KANBAN_COL_COLORS = {
  todo: 'text-surface-600',
  progress: 'text-accent-amber',
  done: 'text-accent-emerald',
}

const PRIORITY_STYLE = {
  high:   { badge: 'bg-red-500/15 text-red-400 border-red-500/20',           dot: 'bg-red-400' },
  medium: { badge: 'bg-accent-amber/15 text-accent-amber border-accent-amber/20', dot: 'bg-accent-amber' },
  low:    { badge: 'bg-surface-300 text-surface-500 border-surface-400/20',   dot: 'bg-surface-400' },
}

const PRIORITIES = ['high', 'medium', 'low']

// ── Kanban card ───────────────────────────────────────────────
function KanbanCard({ task, currentColumnId, columns, onMove, onDelete, onPriority }) {
  const [moving, setMoving] = useState(false)
  const [savingPri, setSavingPri] = useState(false)
  const priority = task.priority ?? 'medium'
  const style = PRIORITY_STYLE[priority]
  const otherCols = columns.filter(c => c.id !== currentColumnId)

  async function handleMove(newColId) {
    setMoving(true)
    await onMove(task.id, newColId)
    setMoving(false)
  }

  async function handlePriority(p) {
    if (p === priority) return
    setSavingPri(true)
    await onPriority(task.id, p)
    setSavingPri(false)
  }

  return (
    <div className="group rounded-lg bg-surface-100 border border-surface-300/50 p-3 space-y-2">
      {/* Title + delete */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-surface-700 leading-snug">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-400 transition-all p-0.5 shrink-0"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Priority pills */}
      <div className="flex gap-1">
        {PRIORITIES.map(p => (
          <button
            key={p}
            onClick={() => handlePriority(p)}
            disabled={savingPri}
            className={`text-xs px-2 py-0.5 rounded-full border capitalize font-medium transition-all disabled:opacity-50 ${
              priority === p ? style.badge : 'border-surface-300/50 text-surface-400 hover:border-surface-400'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Move buttons */}
      <div className="flex gap-1">
        {otherCols.map(col => (
          <button
            key={col.id}
            onClick={() => handleMove(col.id)}
            disabled={moving}
            className={`text-xs px-2 py-1 rounded-md border border-surface-300 transition-colors hover:bg-surface-300 disabled:opacity-50 ${KANBAN_COL_COLORS[col.id]}`}
          >
            → {col.title}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Kanban column ─────────────────────────────────────────────
function KanbanColumn({ col, allColumns, projectName, onMove, onDelete, onAdd, onPriority }) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newTitle.trim()) return
    setSaving(true)
    await onAdd(newTitle.trim(), col.id, projectName, newPriority)
    setNewTitle('')
    setNewPriority('medium')
    setSaving(false)
    setAdding(false)
  }

  // Sort tasks: high → medium → low
  const sorted = [...col.tasks].sort((a, b) =>
    (PRIORITY_WEIGHTS[b.priority] ?? 2) - (PRIORITY_WEIGHTS[a.priority] ?? 2)
  )

  return (
    <div className="flex flex-col rounded-xl bg-surface-200 border border-surface-300/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-300/40">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-semibold ${KANBAN_COL_COLORS[col.id]}`}>{col.title}</h3>
          <span className="text-xs text-surface-500 bg-surface-300 px-1.5 py-0.5 rounded-full">
            {col.tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-surface-500 hover:text-surface-800 transition-colors"
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {adding && (
        <div className="px-3 py-2 border-b border-surface-300/40 space-y-2 bg-surface-100">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Task title…"
            className="w-full px-3 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-sm text-surface-800 outline-none focus:ring-1 focus:ring-accent-indigo placeholder:text-surface-400"
          />
          {/* Priority selector */}
          <div className="flex gap-1">
            {PRIORITIES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setNewPriority(p)}
                className={`flex-1 text-xs py-1 rounded-md border capitalize font-medium transition-all ${
                  newPriority === p ? PRIORITY_STYLE[p].badge : 'border-surface-300/50 text-surface-400 hover:border-surface-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !newTitle.trim()}
              className="flex-1 py-1.5 rounded-md bg-accent-indigo text-white text-xs font-medium disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex-1 py-1.5 rounded-md bg-surface-300 text-surface-700 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-3 space-y-2 min-h-[120px]">
        {sorted.length === 0 ? (
          <p className="text-xs text-surface-500 text-center py-4">No tasks</p>
        ) : (
          sorted.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              currentColumnId={col.id}
              columns={allColumns}
              onMove={onMove}
              onDelete={onDelete}
              onPriority={onPriority}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, loading: projLoading, error: projError, deleteProject } = useProjects()
  const { kanbanColumns, loading: kLoading, error: kError, addTask, moveTask, updateTaskPriority, deleteTask } = useKanban()

  const project = projects.find(p => String(p.id) === String(id))

  const projectColumns = kanbanColumns.map(col => ({
    ...col,
    tasks: col.tasks.filter(t => t.project === project?.name),
  }))

  const allTasks = projectColumns.flatMap(c => c.tasks)
  const doneTasks = projectColumns.find(c => c.id === 'done')?.tasks ?? []
  const progress = calcWeightedProgress(projectColumns, project?.name)

  // Summary: how many tasks remain and their weight breakdown
  const remaining = allTasks.filter(t => !doneTasks.find(d => d.id === t.id))
  const highLeft = remaining.filter(t => t.priority === 'high').length
  const medLeft  = remaining.filter(t => t.priority === 'medium').length
  const lowLeft  = remaining.filter(t => t.priority === 'low').length

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All projects
      </button>

      {/* Header */}
      <DataState loading={projLoading} error={projError}>
        {project ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={`w-4 h-4 rounded-full shrink-0 ${colorMap[project.color] || 'bg-surface-400'}`} />
              <div>
                <h1 className="text-2xl font-bold text-surface-800">{project.name}</h1>
                <p className="text-surface-500 text-sm mt-0.5">{project.lastActivity}</p>
              </div>
              <button
                onClick={async () => { await deleteProject(project.id); navigate('/projects') }}
                className="ml-2 p-1.5 rounded-md text-surface-400 hover:text-red-400 hover:bg-surface-300 transition-all"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Progress + breakdown */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-36 h-2 bg-surface-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colorMap[project.color] || 'bg-surface-400'}`}
                    style={{ width: `${progress ?? 0}%` }}
                  />
                </div>
                <span className="text-sm text-surface-600 font-medium">
                  {progress !== null ? `${progress}%` : 'No tasks'}
                </span>
              </div>
              {allTasks.length > 0 && (
                <div className="flex gap-2 text-xs">
                  {highLeft > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">{highLeft} high</span>}
                  {medLeft  > 0 && <span className="px-2 py-0.5 rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/20">{medLeft} medium</span>}
                  {lowLeft  > 0 && <span className="px-2 py-0.5 rounded-full bg-surface-300 text-surface-500 border border-surface-400/20">{lowLeft} low</span>}
                </div>
              )}
            </div>
          </div>
        ) : (
          !projLoading && <p className="text-surface-500">Project not found.</p>
        )}
      </DataState>

      {/* Kanban board */}
      {project && (
        <section>
          <h2 className="text-lg font-semibold text-surface-800 mb-3">Task board</h2>
          <DataState loading={kLoading} error={kError}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectColumns.map(col => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  allColumns={projectColumns}
                  projectName={project.name}
                  onMove={moveTask}
                  onDelete={deleteTask}
                  onAdd={addTask}
                  onPriority={updateTaskPriority}
                />
              ))}
            </div>
          </DataState>
        </section>
      )}
    </div>
  )
}
