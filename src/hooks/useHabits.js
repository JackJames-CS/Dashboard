import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

export function useHabits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])   // logged_date strings for last 30 days
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const since = new Date()
      since.setDate(since.getDate() - 29)
      const sinceStr = since.toISOString().slice(0, 10)

      const [{ data: h, error: he }, { data: l, error: le }] = await Promise.all([
        supabase.from('habits').select('*').order('created_at'),
        supabase.from('habit_logs').select('habit_id, logged_date').gte('logged_date', sinceStr),
      ])

      if (!mounted) return
      if (he || le) setError(he || le)
      else { setHabits(h || []); setLogs(l || []) }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  function isLoggedToday(habitId) {
    return logs.some(l => l.habit_id === habitId && l.logged_date === today())
  }

  function streakFor(habitId) {
    const dates = logs
      .filter(l => l.habit_id === habitId)
      .map(l => l.logged_date)
      .sort()
      .reverse()
    if (!dates.length) return 0
    let streak = 0
    let cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    for (const d of dates) {
      const expected = cursor.toISOString().slice(0, 10)
      if (d === expected) { streak++; cursor.setDate(cursor.getDate() - 1) }
      else if (d < expected) break
    }
    return streak
  }

  async function addHabit({ name, color = 'indigo' }) {
    const { data, error } = await supabase.from('habits').insert({ name, color }).select().single()
    if (!error) setHabits(h => [...h, data])
    return error
  }

  async function deleteHabit(id) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) setHabits(h => h.filter(x => x.id !== id))
    return error
  }

  async function toggleToday(habitId) {
    const alreadyLogged = isLoggedToday(habitId)
    if (alreadyLogged) {
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', today())
      if (!error) setLogs(l => l.filter(x => !(x.habit_id === habitId && x.logged_date === today())))
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, logged_date: today() })
        .select('habit_id, logged_date')
        .single()
      if (!error) setLogs(l => [...l, data])
    }
  }

  // Current Mon–Sun week for the mini-grid
  function last7(habitId) {
    const now = new Date()
    const diffToMon = now.getDay() === 0 ? -6 : 1 - now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMon)
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const ds = d.toISOString().slice(0, 10)
      days.push({ date: ds, done: logs.some(l => l.habit_id === habitId && l.logged_date === ds) })
    }
    return days
  }

  return { habits, loading, error, isLoggedToday, streakFor, last7, addHabit, deleteHabit, toggleToday }
}
