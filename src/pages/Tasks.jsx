import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useTasks } from '../hooks/useTasks'
import { useKanban } from '../hooks/useKanban'

const views = ['list', 'kanban', 'calendar']

const PRIORITY_DOT = { high: 'bg-red-500', medium: 'bg-accent-amber', low: 'bg-accent-emerald' }
const CATEGORY_BADGE = {
  school: 'bg-accent-violet/20 text-accent-violet',
  work: 'bg-accent-blue/20 text-accent-blue',
  personal: 'bg-accent-emerald/20 text-accent-emerald',
}
const KANBAN_COL_COLORS = {
  todo: 'text-surface-600',
  progress: 'text-accent-amber',
  done: 'text-accent-emerald',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d ago`
  if (diff < 7) return `in ${diff}d`
  return due.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
}

// ── Task item (list view) ─────────────────────────────────────
function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPriority, setEditPriority] = useState(task.priority || 'medium')
  const [editDueDate, setEditDueDate] = useState(task.due_date || '')
  const [editCategory, setEditCategory] = useState(task.category || 'personal')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!editTitle.trim()) return
    setSaving(true)
    await onUpdate(task.id, {
      title: editTitle.trim(),
      priority: editPriority,
      due_date: editDueDate || null,
      category: editCategory,
    })
    setSaving(false)
    setEditing(false)
  }

  function handleCancel() {
    setEditTitle(task.title)
    setEditPriority(task.priority || 'medium')
    setEditDueDate(task.due_date || '')
    setEditCategory(task.category || 'personal')
    setEditing(false)
  }

  const isOverdue = task.status === 'overdue' && !task.done

  return (
    <li className="group">
      <div className="flex items-start gap-2 py-2 border-b border-surface-300/30 last:border-0">
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority || 'medium']}`} />
        <input
          type="checkbox"
          checked={task.done}
          onChange={e => onToggle(task.id, e.target.checked)}
          className="mt-0.5 rounded border-surface-300 text-accent-indigo shrink-0 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setEditing(e => !e)}
            className={`text-sm text-left w-full ${task.done ? 'text-surface-400 line-through' : 'text-surface-700 hover:text-surface-800'}`}
          >
            {task.title}
          </button>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {task.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-surface-500'}`}>
                {formatDate(task.due_date)}
              </span>
            )}
            {task.category && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[task.category]}`}>
                {task.category}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="mt-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 text-surface-400 hover:text-red-400 transition-all p-0.5 shrink-0"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {editing && (
        <div className="mb-2 p-3 rounded-lg bg-surface-100 border border-surface-300/50 space-y-2">
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="w-full px-3 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-sm text-surface-800 outline-none focus:ring-1 focus:ring-accent-indigo"
            placeholder="Task title"
            autoFocus
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={editPriority}
              onChange={e => setEditPriority(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-xs text-surface-700 outline-none"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-xs text-surface-700 outline-none"
            />
            <select
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="px-2 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-xs text-surface-700 outline-none"
            >
              <option value="personal">Personal</option>
              <option value="school">School</option>
              <option value="work">Work</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-1.5 rounded-md bg-accent-indigo text-white text-xs font-medium hover:bg-accent-indigo/90 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-1.5 rounded-md bg-surface-300 text-surface-700 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

// ── Column section (list view) ────────────────────────────────
function TaskColumn({ title, subtitle, tasks, filters, onToggle, onDelete, onUpdate }) {
  const [showCompleted, setShowCompleted] = useState(false)

  const active = tasks.filter(t => !t.done).filter(t => {
    if (filters.category !== 'all' && t.category !== filters.category) return false
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false
    return true
  })
  const completed = tasks.filter(t => t.done)

  return (
    <Card title={title} subtitle={subtitle}>
      {active.length === 0 && (
        <p className="text-surface-500 text-sm text-center py-4">
          {completed.length > 0 ? 'All done here!' : 'Nothing here 🎉'}
        </p>
      )}

      <ul>
        {active.map(t => (
          <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
        ))}
      </ul>

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="mt-3 pt-2 border-t border-surface-300/30">
          <button
            onClick={() => setShowCompleted(s => !s)}
            className="flex items-center gap-2 text-xs text-surface-500 hover:text-surface-700 transition-colors w-full"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Completed ({completed.length})
          </button>
          {showCompleted && (
            <ul className="mt-2 opacity-60">
              {completed.map(t => (
                <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  )
}

// ── Kanban card ───────────────────────────────────────────────
function KanbanCard({ task, currentColumnId, columns, onMove, onDelete }) {
  const [moving, setMoving] = useState(false)

  async function handleMove(newColId) {
    if (newColId === currentColumnId) return
    setMoving(true)
    await onMove(task.id, newColId)
    setMoving(false)
  }

  const otherCols = columns.filter(c => c.id !== currentColumnId)

  return (
    <div className="group rounded-lg bg-surface-100 border border-surface-300/50 p-3 space-y-2">
      <p className="text-sm text-surface-700">{task.title}</p>
      {task.project && (
        <span className="text-xs text-surface-500">{task.project}</span>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {otherCols.map(col => (
            <button
              key={col.id}
              onClick={() => handleMove(col.id)}
              disabled={moving}
              className={`text-xs px-2 py-1 rounded-md border border-surface-300 transition-colors hover:bg-surface-300 disabled:opacity-50 ${KANBAN_COL_COLORS[col.id]}`}
              title={`Move to ${col.title}`}
            >
              → {col.title}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-400 transition-all p-0.5"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Kanban column ─────────────────────────────────────────────
function KanbanColumn({ col, allColumns, onMove, onDelete, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newProject, setNewProject] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newTitle.trim()) return
    setSaving(true)
    await onAdd(newTitle.trim(), col.id, newProject.trim())
    setNewTitle('')
    setNewProject('')
    setSaving(false)
    setAdding(false)
  }

  return (
    <div className="flex flex-col rounded-xl bg-surface-200 border border-surface-300/50 overflow-hidden">
      {/* Column header */}
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

      {/* Add form */}
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
          <input
            value={newProject}
            onChange={e => setNewProject(e.target.value)}
            placeholder="Project (optional)"
            className="w-full px-3 py-1.5 rounded-md border border-surface-300 bg-surface-50 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo placeholder:text-surface-400"
          />
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

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 min-h-[120px]">
        {col.tasks.length === 0 ? (
          <p className="text-xs text-surface-500 text-center py-4">No tasks</p>
        ) : (
          col.tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              currentColumnId={col.id}
              columns={allColumns}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Filter chip ───────────────────────────────────────────────
function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-accent-indigo text-white'
          : 'bg-surface-200 text-surface-600 hover:bg-surface-300 hover:text-surface-800'
      }`}
    >
      {label}
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function Tasks() {
  const [view, setView] = useState('list')
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [newCategory, setNewCategory] = useState('personal')
  const [adding, setAdding] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const { today, upcoming, overdue, loading, error, toggleTask, addTask, updateTask, deleteTask } = useTasks()
  const { kanbanColumns, loading: kLoading, error: kError, addTask: addKanban, moveTask, deleteTask: deleteKanban } = useKanban()

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    await addTask(newTitle.trim(), {
      dueDate: newDueDate || null,
      priority: newPriority,
      category: newCategory,
    })
    setNewTitle('')
    setNewDueDate('')
    setAdding(false)
  }

  const filters = { category: filterCategory, priority: filterPriority }
  const overdueCount = overdue.filter(t => !t.done).length
  const todayRemaining = today.filter(t => !t.done).length

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Tasks</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {todayRemaining} due today
            {overdueCount > 0 && <span className="text-red-400 ml-1">· {overdueCount} overdue</span>}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-100 p-1 self-start sm:self-auto">
          {views.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                view === v ? 'bg-surface-300 text-surface-800 shadow-panel' : 'text-surface-500 hover:text-surface-800'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── List view ── */}
      {view === 'list' && (
        <DataState loading={loading} error={error}>
          {/* Add task form */}
          <form onSubmit={handleAdd} className="flex flex-wrap gap-2 p-4 rounded-xl bg-surface-200 border border-surface-300/50">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Add a task…"
              className="flex-1 min-w-[160px] rounded-lg border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
            />
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className="rounded-lg border border-surface-300 bg-surface-100 px-2 py-2 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              className="rounded-lg border border-surface-300 bg-surface-100 px-2 py-2 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="rounded-lg border border-surface-300 bg-surface-100 px-2 py-2 text-sm text-surface-700 outline-none focus:ring-1 focus:ring-accent-indigo"
            >
              <option value="personal">Personal</option>
              <option value="school">School</option>
              <option value="work">Work</option>
            </select>
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="px-4 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 disabled:opacity-60 transition-colors"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-surface-500 font-medium">Category:</span>
              {['all', 'school', 'work', 'personal'].map(c => (
                <FilterChip
                  key={c}
                  label={c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                  active={filterCategory === c}
                  onClick={() => setFilterCategory(c)}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-surface-500 font-medium">Priority:</span>
              {['all', 'high', 'medium', 'low'].map(p => (
                <FilterChip
                  key={p}
                  label={p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                  active={filterPriority === p}
                  onClick={() => setFilterPriority(p)}
                />
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TaskColumn
              title="Today"
              subtitle={`${todayRemaining} remaining · ${today.filter(t => t.done).length} done`}
              tasks={today}
              filters={filters}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
            <TaskColumn
              title="Upcoming"
              subtitle={`${upcoming.filter(t => !t.done).length} active`}
              tasks={upcoming}
              filters={filters}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
            <TaskColumn
              title="Overdue"
              subtitle={overdueCount > 0 ? `${overdueCount} need attention` : 'All clear'}
              tasks={overdue}
              filters={filters}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          </div>
        </DataState>
      )}

      {/* ── Kanban view ── */}
      {view === 'kanban' && (
        <DataState loading={kLoading} error={kError}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kanbanColumns.map(col => (
              <KanbanColumn
                key={col.id}
                col={col}
                allColumns={kanbanColumns}
                onMove={moveTask}
                onDelete={deleteKanban}
                onAdd={addKanban}
              />
            ))}
          </div>
        </DataState>
      )}

      {/* ── Calendar view ── */}
      {view === 'calendar' && (
        <Card title="Calendar view" subtitle="Tasks by due date">
          <div className="rounded-lg bg-surface-100 border border-surface-300/50 p-8 text-center text-surface-500 text-sm">
            Calendar view — tasks by due date
          </div>
        </Card>
      )}
    </div>
  )
}
