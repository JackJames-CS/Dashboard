import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useWork } from '../hooks/useWork'
import { useDeadlines } from '../hooks/useDeadlines'
import { schoolData, getUpcomingDeadlines, deadlineUrgency } from '../data/mockData'

const viewOptions = ['day', 'week', 'month']
const filterOptions = ['all', 'college', 'work', 'personal']

const categoryColors = {
  school:   'bg-accent-violet/15 text-accent-violet',
  work:     'bg-accent-blue/15 text-accent-blue',
  personal: 'bg-accent-emerald/15 text-accent-emerald',
  projects: 'bg-accent-amber/15 text-accent-amber',
  deadline: 'bg-red-900/30 text-red-400',
}

const filterBadge = {
  college:  'bg-accent-violet/15 text-accent-violet border-accent-violet/30',
  work:     'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  personal: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
  all:      'bg-surface-300 text-surface-700 border-surface-400',
}

// ── Date helpers ───────────────────────────────────────────────
function toISO(d) { return d.toISOString().slice(0, 10) }

function getMondayOf(anchor) {
  const d = new Date(anchor)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDates(anchor) {
  const mon = getMondayOf(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

function formatWeekRange(weekDates) {
  const start = weekDates[0]
  const end = weekDates[6]
  const startStr = start.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
  return `${startStr} – ${endStr}, ${start.getFullYear()}`
}

// Mon=0 … Sun=6
const DAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Build school events for the displayed week ─────────────────
function buildSchoolEvents(weekDates) {
  return schoolData.classes.map((cls, i) => {
    const idx = DAY_INDEX[cls.day]
    if (idx === undefined) return null
    const [start, end] = cls.time.split(/\s*[–-]\s*/)
    return {
      id: 2000 + i,
      title: `${cls.name} ${cls.label}`,
      start, end,
      category: 'school',
      isoDate: toISO(weekDates[idx]),
      room: cls.room,
    }
  }).filter(Boolean)
}

// ── Build school events for the entire displayed month ─────────
function buildMonthSchoolEvents(year, month) {
  const days = new Date(year, month + 1, 0).getDate()
  const events = []
  let id = 3000
  for (let day = 1; day <= days; day++) {
    const d = new Date(year, month, day)
    const jsDay = d.getDay() // 0=Sun
    const label = DAY_LABELS[jsDay === 0 ? 6 : jsDay - 1]
    schoolData.classes.forEach((cls) => {
      if (cls.day === label) {
        const [start, end] = cls.time.split(/\s*[–-]\s*/)
        events.push({ id: id++, title: `${cls.name} ${cls.label}`, start, end, category: 'school', isoDate: toISO(d), room: cls.room })
      }
    })
  }
  return events
}

export default function Calendar() {
  const [view, setView] = useState('week')
  const [filter, setFilter] = useState('all')
  const [weekAnchor, setWeekAnchor] = useState(() => new Date())

  const { events: remoteEvents, loading, error } = useCalendarEvents()
  const { upcomingShifts } = useWork()
  const { deadlines } = useDeadlines()

  const today = new Date()
  const todayISO = toISO(today)
  const weekDates = getWeekDates(weekAnchor)
  const year = weekDates[0].getFullYear()
  const month = weekDates[0].getMonth()

  // Work events — shift_date is already YYYY-MM-DD
  const workEvents = upcomingShifts.map((s, i) => ({
    id: `work-${s.id ?? i}`,
    title: `Work — ${s.role}`,
    start: s.start_time,
    end: s.end_time,
    category: 'work',
    isoDate: s.shift_date,
  }))

  // Deadline events (from Moodle iCal)
  const deadlineEvents = getUpcomingDeadlines(deadlines).map((d, i) => ({
    id: `dl-${i}`,
    title: d.title,
    start: new Date(d.due).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false }),
    end: null,
    category: 'deadline',
    isoDate: toISO(new Date(d.due)),
  }))

  // Remote calendar events — fallback isoDate from day + current month/year
  const remoteEventsWithISO = remoteEvents.map(e => ({
    ...e,
    isoDate: e.event_date ?? e.date ?? toISO(new Date(year, month, e.day)),
  }))

  // View-dependent school events
  const schoolEvents = view === 'month'
    ? buildMonthSchoolEvents(year, month)
    : buildSchoolEvents(weekDates)

  const allEvents = [...schoolEvents, ...workEvents, ...deadlineEvents, ...remoteEventsWithISO]

  const catForFilter = { college: 'school', work: 'work', personal: 'personal' }
  const filtered = filter === 'all' ? allEvents : allEvents.filter(e => e.category === catForFilter[filter])

  function dayEvents(isoDate) {
    return filtered.filter(e => e.isoDate === isoDate)
      .sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''))
  }

  // Computed WEEK_DAYS for the grid
  const WEEK_DAYS = weekDates.map(d => ({
    label: d.toLocaleDateString('en-US', { weekday: 'short' }),
    date: d.getDate(),
    isoDate: toISO(d),
  }))

  // Week navigation
  function shiftWeek(delta) {
    setWeekAnchor(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + delta * 7)
      return d
    })
  }

  // Month view data
  const firstDow = new Date(year, month, 1).getDay() // 0=Sun
  const leadingBlanks = firstDow === 0 ? 6 : firstDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthTitle = new Date(year, month, 1).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })

  // Day view — always shows today
  const dayViewTitle = today.toLocaleDateString('en-IE', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Calendar</h1>
          <p className="text-surface-500 text-sm mt-0.5">{formatWeekRange(weekDates)}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Week navigation */}
          <div className="flex gap-1">
            <button
              onClick={() => shiftWeek(-1)}
              className="px-2 py-1.5 rounded-md text-sm text-surface-600 hover:text-surface-800 hover:bg-surface-100 transition-colors"
            >‹</button>
            <button
              onClick={() => { setWeekAnchor(new Date()) }}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-100 transition-colors"
            >Today</button>
            <button
              onClick={() => shiftWeek(1)}
              className="px-2 py-1.5 rounded-md text-sm text-surface-600 hover:text-surface-800 hover:bg-surface-100 transition-colors"
            >›</button>
          </div>
          {/* View toggle */}
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
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-colors ${
              filter === f ? filterBadge[f] : 'text-surface-500 border-surface-300/50 hover:border-surface-400 hover:text-surface-600'
            }`}
          >
            {f === 'college' ? 'College' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-surface-600">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent-violet/80" /> College</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent-blue/80" /> Work</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-accent-emerald/80" /> Personal</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-500/70" /> Deadlines</span>
      </div>

      <DataState loading={loading} error={error}>
        {/* Day view */}
        {view === 'day' && (
          <Card title={`Today — ${dayViewTitle}`}>
            <div className="space-y-2">
              {dayEvents(todayISO).length === 0 && (
                <p className="text-sm text-surface-400">No events for this filter today.</p>
              )}
              {dayEvents(todayISO).map((ev) => (
                <div key={ev.id} className={`rounded-lg p-3 ${categoryColors[ev.category] || 'bg-surface-100'}`}>
                  <p className="font-medium text-surface-800">{ev.title}</p>
                  <p className="text-sm opacity-80">
                    {ev.start}{ev.end ? ` – ${ev.end}` : ''}{ev.room ? ` · ${ev.room}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Week view */}
        {view === 'week' && (
          <Card title={`Week — ${formatWeekRange(weekDates)}`}>
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map(({ label, date, isoDate }) => (
                <div
                  key={isoDate}
                  className={`rounded-lg border p-2 min-h-[120px] ${
                    isoDate === todayISO
                      ? 'bg-accent-indigo/5 border-accent-indigo/30'
                      : 'bg-surface-50 border-surface-200/80'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-2 ${isoDate === todayISO ? 'text-accent-indigo' : 'text-surface-500'}`}>
                    {label} {date}
                  </p>
                  {dayEvents(isoDate).map((ev) => (
                    <div
                      key={ev.id}
                      className={`rounded px-1.5 py-0.5 text-xs font-medium mb-1 truncate ${categoryColors[ev.category] || 'bg-surface-200'}`}
                      title={`${ev.title} ${ev.start ?? ''}${ev.end ? `–${ev.end}` : ''}`}
                    >
                      <span className="opacity-70">{ev.start}</span> {ev.title.split(' ')[0]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Month view */}
        {view === 'month' && (
          <Card title={monthTitle}>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="text-xs font-semibold text-surface-500 py-1">{d}</div>
              ))}
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = i + 1
                const isoDate = toISO(new Date(year, month, date))
                const evs = dayEvents(isoDate)
                return (
                  <div
                    key={date}
                    className={`rounded-lg p-1 min-h-[60px] text-left ${
                      isoDate === todayISO ? 'ring-1 ring-accent-indigo bg-accent-indigo/5' : 'bg-surface-50'
                    }`}
                  >
                    <span className={`block text-xs mb-0.5 ${isoDate === todayISO ? 'font-bold text-accent-indigo' : 'text-surface-500'}`}>
                      {date}
                    </span>
                    {evs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded px-1 text-xs truncate mb-0.5 ${categoryColors[ev.category] || 'bg-surface-200'}`}
                      >
                        {ev.title.split(' ')[0]}
                      </div>
                    ))}
                    {evs.length > 2 && (
                      <span className="text-xs text-surface-400">+{evs.length - 2}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </DataState>
    </div>
  )
}
