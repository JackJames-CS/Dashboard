import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useWork } from '../hooks/useWork'

const ROLES = ['Support', 'Supervisor', 'Training', 'Other']

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })
}

function fmtShort(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-xl p-4 text-center border ${accent ? 'bg-accent-emerald/10 border-accent-emerald/20' : 'bg-surface-100 border-surface-200/80'}`}>
      <p className={`text-3xl font-bold font-mono ${accent ? 'text-accent-emerald' : 'text-surface-800'}`}>{value}</p>
      <p className="text-xs text-surface-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function ShiftRow({ shift, onDelete, breakMinutes = 0 }) {
  const start = shift.start_time
  const end = shift.end_time
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let endH = eh + em / 60
  const startH = sh + sm / 60
  if (endH <= startH) endH += 24
  const hours = Math.max(0, endH - startH - breakMinutes / 60).toFixed(1)

  return (
    <li className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0 group text-sm">
      <span className="font-medium text-surface-700 w-28 shrink-0">{formatDate(shift.shift_date)}</span>
      <span className="text-surface-500 w-24 shrink-0">{start}–{end}</span>
      <span className="text-xs px-2 py-0.5 rounded bg-accent-blue/10 text-accent-blue shrink-0">{shift.role}</span>
      <span className="text-surface-500 shrink-0">{hours}h</span>
      {shift.notes && <span className="text-surface-400 truncate flex-1">{shift.notes}</span>}
      {!shift.notes && <span className="flex-1" />}
      <button
        onClick={() => onDelete(shift.id)}
        className="opacity-0 group-hover:opacity-100 text-surface-400 hover:text-red-500 transition-all text-xs shrink-0"
      >
        ✕
      </button>
    </li>
  )
}

export default function Work() {
  const {
    upcomingShifts,
    pastShifts,
    settings,
    loading,
    error,
    hoursThisWeek,
    earningsThisWeek,
    currentPaycheck,
    currentPaycheckHours,
    prevThursdayStr,
    nextThursdayStr,
    addShift,
    deleteShift,
    updateSettings,
    importFromCalendar,
  } = useWork()

  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ shift_date: '', start_time: '', end_time: '', role: 'Support', notes: '' })
  const [rateInput, setRateInput] = useState('')
  const [currencyInput, setCurrencyInput] = useState('')
  const [breakInput, setBreakInput] = useState('')
  const [importing, setImporting] = useState(false)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.shift_date || !form.start_time || !form.end_time) return
    const err = await addShift(form)
    if (!err) {
      setForm({ shift_date: '', start_time: '', end_time: '', role: 'Support', notes: '' })
      setShowForm(false)
      showToast('Shift added.')
    } else {
      showToast('Error: ' + err.message)
    }
  }

  async function handleImport() {
    setImporting(true)
    const { count, error } = await importFromCalendar()
    setImporting(false)
    if (error) showToast('Import error: ' + error)
    else showToast(count === 0 ? 'No new shifts found.' : `Imported ${count} shift${count !== 1 ? 's' : ''}.`)
  }

  async function handleRateBlur() {
    const rate = parseFloat(rateInput)
    if (!isNaN(rate) && rate > 0) {
      await updateSettings({ hourly_rate: rate, currency: settings.currency, break_minutes: settings.break_minutes })
    }
    setRateInput('')
  }

  async function handleCurrencyBlur() {
    if (currencyInput.trim()) {
      await updateSettings({ hourly_rate: settings.hourly_rate, currency: currencyInput.trim().toUpperCase(), break_minutes: settings.break_minutes })
    }
    setCurrencyInput('')
  }

  async function handleBreakBlur() {
    const mins = parseInt(breakInput, 10)
    if (!isNaN(mins) && mins >= 0) {
      await updateSettings({ hourly_rate: settings.hourly_rate, currency: settings.currency, break_minutes: mins })
    }
    setBreakInput('')
  }

  const displayRate = rateInput !== '' ? rateInput : settings.hourly_rate
  const displayCurrency = currencyInput !== '' ? currencyInput : settings.currency
  const displayBreak = breakInput !== '' ? breakInput : settings.break_minutes

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-surface-700 border border-surface-600 px-4 py-2.5 text-sm text-surface-800 shadow-panel">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Work</h1>
          <p className="text-surface-500 text-sm mt-0.5">Shifts, hours &amp; earnings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-3 py-1.5 rounded-lg border border-surface-300 text-surface-600 text-sm font-medium hover:bg-surface-100 transition-colors disabled:opacity-50"
          >
            {importing ? 'Importing…' : 'Import from calendar'}
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue/90 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add shift'}
          </button>
        </div>
      </div>

      <DataState loading={loading} error={error}>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Current paycheck"
            value={`${settings.currency === 'EUR' ? '€' : '$'}${currentPaycheck.toFixed(2)}`}
            sub={currentPaycheckHours > 0 ? `Paid ${fmtShort(prevThursdayStr)}` : `No shifts · ${fmtShort(prevThursdayStr)}`}
            accent
          />
          <StatCard
            label="Expected this week"
            value={`${settings.currency === 'EUR' ? '€' : '$'}${earningsThisWeek.toFixed(2)}`}
            sub={`Due ${fmtShort(nextThursdayStr)}`}
          />
          <StatCard
            label="Hours this week"
            value={`${hoursThisWeek.toFixed(1)}h`}
            sub="Mon – Sun"
          />
          <StatCard
            label="Hourly rate"
            value={`${settings.currency === 'EUR' ? '€' : '$'}${Number(settings.hourly_rate).toFixed(2)}`}
            sub="per hour"
          />
        </div>

        {/* Add shift form */}
        {showForm && (
          <Card title="New shift" subtitle="Log a shift manually">
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Date</label>
                <input
                  type="date"
                  value={form.shift_date}
                  onChange={(e) => setForm((f) => ({ ...f, shift_date: e.target.value }))}
                  required
                  className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Start time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                  required
                  className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">End time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                  required
                  className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-surface-500">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-2">
                <label className="text-xs text-surface-500">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. covered for someone"
                  className="rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </div>
              <div className="col-span-2 sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue/90 transition-colors"
                >
                  Save shift
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Upcoming shifts */}
        <Card title="Upcoming shifts" subtitle={`${upcomingShifts.length} shift${upcomingShifts.length !== 1 ? 's' : ''}`}>
          {upcomingShifts.length === 0 ? (
            <p className="text-sm text-surface-400 py-2">No upcoming shifts logged.</p>
          ) : (
            <ul className="space-y-0">
              {upcomingShifts.map((s) => (
                <ShiftRow key={s.id} shift={s} onDelete={deleteShift} breakMinutes={settings.break_minutes} />
              ))}
            </ul>
          )}
        </Card>

        {/* Past shifts */}
        <Card title="Past shifts" subtitle="Last 10">
          {pastShifts.length === 0 ? (
            <p className="text-sm text-surface-400 py-2">No past shifts logged.</p>
          ) : (
            <ul className="space-y-0">
              {pastShifts.map((s) => (
                <ShiftRow key={s.id} shift={s} onDelete={deleteShift} breakMinutes={settings.break_minutes} />
              ))}
            </ul>
          )}
        </Card>

        {/* Settings */}
        <Card title="Settings" subtitle="Pay rate & currency">
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Hourly rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={displayRate}
                onChange={(e) => setRateInput(e.target.value)}
                onBlur={handleRateBlur}
                className="w-28 rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Currency</label>
              <input
                type="text"
                maxLength={3}
                value={displayCurrency}
                onChange={(e) => setCurrencyInput(e.target.value)}
                onBlur={handleCurrencyBlur}
                className="w-20 rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 uppercase focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500">Unpaid break (mins)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={displayBreak}
                onChange={(e) => setBreakInput(e.target.value)}
                onBlur={handleBreakBlur}
                className="w-24 rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
          </div>
        </Card>
      </DataState>
    </div>
  )
}
