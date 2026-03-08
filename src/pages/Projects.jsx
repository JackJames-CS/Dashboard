import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useKanban } from '../hooks/useKanban'

export default function Projects() {
  const { kanbanColumns, loading, error } = useKanban()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Projects</h1>
          <p className="text-surface-500 text-sm mt-0.5">Project overview, tasks & AI interactions</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 transition-colors">
          New project
        </button>
      </div>

      {/* Project overview — placeholder */}
      <Card title="Active project" subtitle="Capstone MVP">
        <div className="flex gap-6 flex-wrap">
          <div className="rounded-lg bg-surface-50 px-4 py-2">
            <p className="text-2xl font-semibold text-surface-800">40%</p>
            <p className="text-xs text-surface-500">Progress</p>
          </div>
          <div className="rounded-lg bg-surface-50 px-4 py-2">
            <p className="text-2xl font-semibold text-surface-800">12</p>
            <p className="text-xs text-surface-500">Tasks left</p>
          </div>
          <div className="rounded-lg bg-surface-50 px-4 py-2">
            <p className="text-2xl font-semibold text-surface-800">3</p>
            <p className="text-xs text-surface-500">Notes</p>
          </div>
        </div>
      </Card>

      {/* Kanban task board */}
      <section>
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Task board</h2>
        <DataState loading={loading} error={error}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kanbanColumns.map((col) => (
              <div
                key={col.id}
                className="rounded-xl bg-surface-50 border border-surface-200/80 overflow-hidden flex flex-col min-h-[280px]"
              >
                <div className="px-4 py-3 border-b border-surface-200 bg-white">
                  <h3 className="text-sm font-semibold text-surface-800">{col.title}</h3>
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {col.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg bg-white border border-surface-200/80 p-3 shadow-panel hover:shadow-card transition-shadow"
                    >
                      <p className="text-sm font-medium text-surface-800">{task.title}</p>
                      <p className="text-xs text-surface-500 mt-1">{task.project}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DataState>
      </section>

      {/* Notes / Files / AI — placeholder sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Notes">
          <p className="text-sm text-surface-500">Project notes will appear here.</p>
        </Card>
        <Card title="Files">
          <p className="text-sm text-surface-500">Attachments and docs.</p>
        </Card>
        <Card title="AI interactions">
          <p className="text-sm text-surface-500">AI suggestions for this project.</p>
        </Card>
      </div>
    </div>
  )
}
