import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

const viewOptions = ['day', 'week', 'month']
const categoryColors = { school: 'bg-accent-violet/15 text-accent-violet', work: 'bg-accent-blue/15 text-accent-blue', personal: 'bg-accent-emerald/15 text-accent-emerald', projects: 'bg-accent-amber/15 text-accent-amber' }

export default function Calendar() {
  const [view, setView] = useState('week')
  const { events, loading, error } = useCalendarEvents()

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Calendar</h1>
          <p className="text-surface-500 text-sm mt-0.5">Day, week & month — color-coded by category</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-100 p-1">
          {viewOptions.map((v) => (
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

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-accent-violet/80" /> School
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-accent-blue/80" /> Work
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-accent-emerald/80" /> Personal
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-accent-amber/80" /> Projects
        </span>
      </div>

      <DataState loading={loading} error={error}>
        {view === 'day' && (
          <Card title="Day view — Thursday, Mar 5">
            <div className="space-y-2">
              {events.filter((e) => e.day === 5).map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-lg p-3 ${categoryColors[ev.category] || 'bg-surface-100'}`}
                >
                  <p className="font-medium text-surface-800">{ev.title}</p>
                  <p className="text-sm opacity-80">{ev.start} – {ev.end}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {view === 'week' && (
          <Card title="Week view — Mar 3–9">
            <div className="grid grid-cols-7 gap-2">
              {[3, 4, 5, 6, 7, 8, 9].map((day) => (
                <div key={day} className="rounded-lg bg-surface-50 border border-surface-200/80 p-2 min-h-[120px]">
                  <p className="text-xs font-semibold text-surface-500 mb-2">
                    {day === 5 ? 'Thu' : day === 6 ? 'Fri' : day === 3 ? 'Mon' : day === 4 ? 'Tue' : day === 7 ? 'Sat' : day === 8 ? 'Sun' : 'Wed'} {day}
                  </p>
                  {events
                    .filter((e) => e.day === day)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded px-2 py-1 text-xs font-medium mb-1 ${categoryColors[ev.category] || 'bg-surface-200'}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </Card>
        )}

        {view === 'month' && (
          <Card title="Month view — March 2026">
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-xs font-semibold text-surface-500 py-1">
                  {d}
                </div>
              ))}
              {/* March 2026 starts on Sunday — 0 empty cells */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                <div
                  key={date}
                  className={`rounded-lg p-2 min-h-[60px] text-sm ${
                    date === 7 ? 'ring-1 ring-accent-indigo bg-accent-indigo/5' : 'bg-surface-50'
                  }`}
                >
                  {date}
                </div>
              ))}
            </div>
          </Card>
        )}
      </DataState>
    </div>
  )
}
