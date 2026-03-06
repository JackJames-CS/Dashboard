import Card from '../ui/Card'
import { aiPlannerSuggestions } from '../../data/mockData'

export default function AIPlannerPanel() {
  return (
    <Card
      title="AI Planner"
      subtitle="Suggested schedule"
      action={
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-indigo/15 text-accent-indigo font-medium">AI</span>
      }
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Suggested today</h4>
          <ul className="space-y-1 text-sm text-surface-700">
            {aiPlannerSuggestions.dailySchedule.slice(0, 4).map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-accent-indigo/5 border border-accent-indigo/20 p-3">
          <p className="text-sm text-surface-700">{aiPlannerSuggestions.studyRec}</p>
        </div>
        <p className="text-xs text-surface-500">{aiPlannerSuggestions.focusBlocks}</p>
      </div>
    </Card>
  )
}
