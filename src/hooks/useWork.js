import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function parseHHMM(str) {
  const [h, m] = str.split(':').map(Number)
  return h + m / 60
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function shiftHours(shift, breakMinutes = 0) {
  const startH = parseHHMM(shift.start_time)
  let endH = parseHHMM(shift.end_time)
  if (endH <= startH) endH += 24 // overnight shift
  return Math.max(0, endH - startH - breakMinutes / 60)
}

function getPaydayThursday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const diffToMon = d.getDay() === 0 ? -6 : 1 - d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() + diffToMon)
  const payday = new Date(mon)
  payday.setDate(mon.getDate() + 10)
  return payday.toISOString().slice(0, 10)
}

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day + 6) % 7))
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { mon, sun }
}

export function useWork() {
  const [shifts, setShifts] = useState([])
  const [settings, setSettings] = useState({ hourly_rate: 16.0, currency: 'EUR', break_minutes: 30, id: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [shiftsRes, settingsRes] = await Promise.all([
      supabase.from('work_shifts').select('*').order('shift_date', { ascending: false }).order('start_time', { ascending: false }),
      supabase.from('work_settings').select('*').limit(1).single(),
    ])
    if (shiftsRes.error) setError(shiftsRes.error.message)
    else setShifts(shiftsRes.data)
    if (settingsRes.data) setSettings(settingsRes.data)
    setLoading(false)
  }

  async function addShift({ shift_date, start_time, end_time, role, notes }) {
    const { data, error } = await supabase
      .from('work_shifts')
      .insert({ shift_date, start_time, end_time, role: role || 'Support', notes: notes || '' })
      .select()
      .single()
    if (!error) setShifts((prev) => [data, ...prev].sort((a, b) => b.shift_date.localeCompare(a.shift_date)))
    return error
  }

  async function deleteShift(id) {
    const { error } = await supabase.from('work_shifts').delete().eq('id', id)
    if (!error) setShifts((prev) => prev.filter((s) => s.id !== id))
  }

  async function updateSettings({ hourly_rate, currency, break_minutes }) {
    const newSettings = {
      ...settings,
      hourly_rate: parseFloat(hourly_rate),
      currency,
      break_minutes: parseInt(break_minutes, 10),
    }
    if (settings.id) {
      await supabase.from('work_settings').update({
        hourly_rate: newSettings.hourly_rate,
        currency: newSettings.currency,
        break_minutes: newSettings.break_minutes,
      }).eq('id', settings.id)
    } else {
      const { data } = await supabase.from('work_settings').insert({
        hourly_rate: newSettings.hourly_rate,
        currency: newSettings.currency,
        break_minutes: newSettings.break_minutes,
      }).select().single()
      if (data) newSettings.id = data.id
    }
    setSettings(newSettings)
  }

  async function importFromCalendar() {
    const { data: events, error } = await supabase.from('schedule_events').select('*').eq('type', 'work')
    if (error) return { count: 0, error: error.message }

    let count = 0
    for (const ev of events) {
      const shift_date = ev.day_date
      const start_time = ev.time
      const end_time = addMinutes(ev.time, ev.duration)
      // skip if already exists
      const exists = shifts.some((s) => s.shift_date === shift_date && s.start_time === start_time)
      if (exists) continue
      const { data: inserted, error: insertErr } = await supabase
        .from('work_shifts')
        .insert({ shift_date, start_time, end_time, role: 'Work', notes: ev.title })
        .select()
        .single()
      if (!insertErr && inserted) {
        setShifts((prev) => [inserted, ...prev].sort((a, b) => b.shift_date.localeCompare(a.shift_date)))
        count++
      }
    }
    return { count }
  }

  const today = new Date().toISOString().slice(0, 10)
  const { mon, sun } = getWeekBounds()

  // This week's hours/expected earnings (Mon–Sun, paid next Thu)
  const hoursThisWeek = shifts
    .filter((s) => {
      const d = new Date(s.shift_date + 'T12:00:00')
      return d >= mon && d <= sun
    })
    .reduce((sum, s) => sum + shiftHours(s, settings.break_minutes), 0)
  const earningsThisWeek = hoursThisWeek * settings.hourly_rate

  // Payday dates: previous Thursday = Mon + 3, next Thursday = Mon + 10
  const prevThursday = new Date(mon); prevThursday.setDate(mon.getDate() + 3)
  const nextThursday = new Date(mon); nextThursday.setDate(mon.getDate() + 10)
  const prevThursdayStr = prevThursday.toISOString().slice(0, 10)
  const nextThursdayStr = nextThursday.toISOString().slice(0, 10)

  // Current paycheck = shifts whose payday was the previous Thursday
  const currentPaycheckHours = shifts
    .filter((s) => getPaydayThursday(s.shift_date) === prevThursdayStr)
    .reduce((sum, s) => sum + shiftHours(s, settings.break_minutes), 0)
  const currentPaycheck = currentPaycheckHours * settings.hourly_rate

  const upcomingShifts = shifts.filter((s) => s.shift_date >= today).sort((a, b) => a.shift_date.localeCompare(b.shift_date))
  const pastShifts = shifts.filter((s) => s.shift_date < today).slice(0, 10)

  return {
    shifts,
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
  }
}
