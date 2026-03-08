import { rightPanelData } from '../data/mockData'

export default function RightPanel() {
  const { quickNote, recentActivity } = rightPanelData

  return (
    <aside className="hidden xl:flex xl:flex-col w-[var(--right-panel-width)] flex-shrink-0 bg-surface-200 border-l border-surface-300/50 overflow-hidden">
      <div className="p-4 border-b border-surface-300/40">
        <h2 className="text-sm font-semibold text-surface-800">Quick tools</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick notes */}
        <div className="rounded-xl bg-surface-100 border border-surface-300/50 p-3 shadow-panel">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Quick note</h3>
          <textarea
            placeholder="Jot something down..."
            defaultValue={quickNote}
            className="w-full min-h-[80px] text-sm text-surface-700 bg-transparent resize-none outline-none placeholder:text-surface-400"
            rows={3}
          />
        </div>

        {/* Recent activity */}
        <div className="rounded-xl bg-surface-100 border border-surface-300/50 p-3 shadow-panel">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Recent activity</h3>
          <ul className="space-y-2">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-surface-400 shrink-0">{item.action}:</span>
                <span className="text-surface-700 truncate">{item.item}</span>
                <span className="text-surface-400 text-xs ml-auto shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick task */}
        <div className="rounded-xl bg-surface-100 border border-surface-300/50 p-3 shadow-panel">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Quick task</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a task..."
              className="flex-1 px-3 py-2 rounded-lg border border-surface-300 bg-surface-50 text-surface-800 text-sm outline-none focus:ring-2 focus:ring-accent-indigo/20 focus:border-accent-indigo placeholder:text-surface-400"
            />
            <button className="px-3 py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* AI chat preview */}
        <div className="rounded-xl bg-gradient-to-br from-accent-indigo/10 to-accent-violet/10 border border-accent-indigo/20 p-3 shadow-panel">
          <h3 className="text-xs font-semibold text-accent-indigo uppercase tracking-wider mb-2">AI Assistant</h3>
          <p className="text-sm text-surface-600 mb-2">Ask me to schedule focus blocks, summarize notes, or plan your week.</p>
          <button className="w-full py-2 rounded-lg bg-accent-indigo text-white text-sm font-medium hover:bg-accent-indigo/90 transition-colors">
            Open chat
          </button>
        </div>
      </div>
    </aside>
  )
}
