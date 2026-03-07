import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useTasks } from '../hooks/useTasks'

const views = ['list', 'kanban', 'calendar']

export default function Tasks() {
  const [view, setView] = useState('list')
  const [newTitle, setNewTitle] = useState('')
  const { today, upcoming, overdue, loading, error, toggleTask, addTask, deleteTask } = useTasks()

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await addTask(newTitle.trim())
    setNewTitle('')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Tasks</h1>
          <p className="text-surface-500 text-sm mt-0.5">List, kanban & calendar views</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                view === v ? 'bg-white text-surface-800 shadow-panel' : 'text-surface-600 hover:text-surface-800'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' && (
        <DataState loading={loading} error={error}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Today" subtitle={`${today.length} tasks`}>
              <form onSubmit={handleAdd} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Add task…"
                  className="flex-1 rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-accent-indigo"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 transition-colors"
                >
                  Add
                </button>
              </form>
              <ul className="space-y-2">
                {today.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 py-2 border-b border-surface-100 last:border-0 group">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={(e) => toggleTask(t.id, e.target.checked)}
                      className="rounded border-surface-300 text-accent-indigo"
                    />
                    <span className={`flex-1 ${t.done ? 'text-surface-400 line-through' : 'text-surface-700'}`}>{t.title}</span>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all text-xs"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Upcoming" subtitle={`${upcoming.length} tasks`}>
              <ul className="space-y-2">
                {upcoming.map((t) => (
                  <li key={t.id} className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0">
                    <span className="text-surface-700">{t.title}</span>
                    <span className="text-xs text-surface-500">{t.due}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Overdue" subtitle={`${overdue.length} tasks`}>
              <ul className="space-y-2">
                {overdue.map((t) => (
                  <li key={t.id} className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0">
                    <span className="text-surface-700">{t.title}</span>
                    <span className="text-xs text-red-600">{t.overdue}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </DataState>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['To Do', 'In Progress', 'Done'].map((col) => (
            <div key={col} className="rounded-xl bg-surface-50 border border-surface-200/80 p-4 min-h-[200px]">
              <h3 className="text-sm font-semibold text-surface-800 mb-3">{col}</h3>
              <div className="space-y-2">
                <div className="rounded-lg bg-white border border-surface-200/80 p-3 text-sm text-surface-600">
                  Drag tasks here
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <Card title="Calendar view" subtitle="Tasks by date">
          <div className="rounded-lg bg-surface-50 border border-surface-200 p-8 text-center text-surface-500 text-sm">
            Calendar view placeholder — tasks would be shown by due date.
          </div>
        </Card>
      )}
    </div>
  )
}
