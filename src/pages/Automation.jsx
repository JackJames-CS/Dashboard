import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useAutomations } from '../hooks/useAutomations'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelative(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  const now  = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs < 0) {
    // Future date (used for next_run)
    const futureMins = Math.abs(diffMins)
    const futureHours = Math.floor(futureMins / 60)
    const futureDays = Math.floor(futureHours / 24)
    if (futureDays > 0) return `in ${futureDays}d`
    if (futureHours > 0) return `in ${futureHours}h`
    return `in ${futureMins}m`
  }

  if (diffMins < 1)   return 'just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7)   return `${diffDays}d ago`
  return date.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
}

function formatAbsolute(isoString) {
  if (!isoString) return null
  return new Date(isoString).toLocaleString('en-IE', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  success: 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30',
  error:   'bg-red-500/15 text-red-400 border border-red-500/30',
  running: 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30',
  never:   'bg-surface-300/40 text-surface-500 border border-surface-400/30',
}

const STATUS_LABELS = {
  success: '✓ Success',
  error:   '✗ Error',
  running: '⟳ Running',
  never:   '— Never run',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.never}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// ── Automation card ───────────────────────────────────────────────────────────

function AutomationCard({ automation, onTrigger }) {
  const [triggering, setTriggering] = useState(false)
  const [triggered, setTriggered]   = useState(false)

  async function handleRunNow() {
    setTriggering(true)
    const ok = await onTrigger(automation.id)
    setTriggering(false)
    if (ok) {
      setTriggered(true)
      // Reset the "queued" message after 5s
      setTimeout(() => setTriggered(false), 5000)
    }
  }

  const isRunning = automation.status === 'running' || automation.trigger_now

  return (
    <div className="rounded-xl bg-surface-200 border border-surface-300/50 shadow-card overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-surface-300/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Animated pulse when running */}
          {isRunning && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-blue" />
            </span>
          )}
          <h3 className="text-sm font-semibold text-surface-800 truncate">{automation.name}</h3>
          <StatusBadge status={automation.status} />
        </div>

        <button
          onClick={handleRunNow}
          disabled={triggering || isRunning}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-blue/15 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {triggering ? 'Queuing…' : triggered ? 'Queued ✓' : 'Run Now'}
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        {automation.description && (
          <p className="text-xs text-surface-500">{automation.description}</p>
        )}

        {/* Timing row */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-surface-500">Last run: </span>
            <span className="text-surface-700" title={formatAbsolute(automation.last_run)}>
              {automation.last_run ? formatRelative(automation.last_run) : '—'}
            </span>
          </div>
          <div>
            <span className="text-surface-500">Next run: </span>
            <span className="text-surface-700" title={formatAbsolute(automation.next_run)}>
              {automation.next_run ? formatRelative(automation.next_run) : '—'}
            </span>
          </div>
        </div>

        {/* Log snippet */}
        {automation.log && (
          <div className="rounded-lg bg-surface-100/60 border border-surface-300/30 p-3">
            <p className="text-xs text-surface-500 mb-1 font-medium">Last log</p>
            <pre className="text-xs text-surface-600 font-mono whitespace-pre-wrap break-all leading-relaxed">
              {automation.log.split('\n').slice(-6).join('\n').trim()}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

// ── System info strip ─────────────────────────────────────────────────────────

function SystemInfo({ automations }) {
  // Count runs today using last_run timestamps
  const today = new Date().toISOString().slice(0, 10)
  const runsToday = automations.filter(a => a.last_run?.startsWith(today)).length

  const cronActive = automations.filter(a => a.next_run).length

  // Stats are partially mocked — VPS uptime is static, others are real
  const stats = [
    { label: 'Automations',   value: automations.length },
    { label: 'Cron schedules', value: cronActive },
    { label: 'Runs today',    value: runsToday },
    { label: 'VPS',           value: 'Online' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="rounded-xl bg-surface-200 border border-surface-300/50 shadow-card px-4 py-3"
        >
          <p className="text-xs text-surface-500">{stat.label}</p>
          <p className="text-lg font-semibold text-surface-800 mt-0.5">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Automation() {
  const { automations, loading, error, triggerNow } = useAutomations()

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-surface-900">Mission Control</h1>
        <p className="text-sm text-surface-500 mt-0.5">
          Scheduled automations running on the VPS. Polls every 30s.
        </p>
      </div>

      <DataState loading={loading} error={error}>
        <>
          {/* System stats */}
          <SystemInfo automations={automations} />

          {/* Automation cards */}
          {automations.length === 0 ? (
            <Card>
              <p className="text-sm text-surface-500 text-center py-4">
                No automations yet.{' '}
                <span className="text-surface-600">
                  Run the SQL in <code className="font-mono text-xs bg-surface-300/40 px-1 py-0.5 rounded">add-automations-table.sql</code> to get started.
                </span>
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {automations.map(automation => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  onTrigger={triggerNow}
                />
              ))}
            </div>
          )}
        </>
      </DataState>
    </div>
  )
}
