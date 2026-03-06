import { useState } from 'react'
import Card from '../components/ui/Card'
import { tasksData } from '../data/mockData'

const views = ['list', 'kanban', 'calendar']

export default function Tasks() {
  const [view, setView] = useState('list')

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Today" subtitle={`${tasksData.today.length} tasks`}>
            <ul className="space-y-2">
              {tasksData.today.map((t) => (
                <li key={t.id} className="flex items-center gap-2 py-2 border-b border-surface-100 last:border-0">
                  <input type="checkbox" defaultChecked={t.done} className="rounded border-surface-300 text-accent-indigo" />
                  <span className={t.done ? 'text-surface-400 line-through' : 'text-surface-700'}>{t.title}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Upcoming" subtitle={`${tasksData.upcoming.length} tasks`}>
            <ul className="space-y-2">
              {tasksData.upcoming.map((t) => (
                <li key={t.id} className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0">
                  <span className="text-surface-700">{t.title}</span>
                  <span className="text-xs text-surface-500">{t.due}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Overdue" subtitle={`${tasksData.overdue.length} tasks`}>
            <ul className="space-y-2">
              {tasksData.overdue.map((t) => (
                <li key={t.id} className="flex justify-between items-center py-2 border-b border-surface-100 last:border-0">
                  <span className="text-surface-700">{t.title}</span>
                  <span className="text-xs text-red-600">{t.overdue}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
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
