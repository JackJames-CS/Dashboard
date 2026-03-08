import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function computeStatus(dueDate) {
  if (!dueDate) return 'today'
  const [y, m, d] = dueDate.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

function sortTasks(arr) {
  return [...arr].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority || 'medium']
    const pB = PRIORITY_ORDER[b.priority || 'medium']
    if (pA !== pB) return pA - pB
    if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return 0
  })
}

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)

    // Auto-purge tasks completed on a previous day
    const todayISO = new Date().toISOString().slice(0, 10)
    await supabase
      .from('tasks')
      .delete()
      .eq('done', true)
      .lt('completed_at', todayISO)

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setTasks(data)
    setLoading(false)
  }

  async function toggleTask(id, done) {
    const updates = { done, completed_at: done ? new Date().toISOString() : null }
    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  async function addTask(title, { dueDate = null, priority = 'medium', category = 'personal' } = {}) {
    const status = computeStatus(dueDate)
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, status, category, priority, due_date: dueDate || null })
      .select()
      .single()
    if (!error) setTasks(prev => [...prev, data])
  }

  async function updateTask(id, updates) {
    const payload = { ...updates }
    if ('due_date' in payload) {
      payload.due_date = payload.due_date || null
      payload.status = computeStatus(payload.due_date)
    }
    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (!error) setTasks(prev => prev.map(t => t.id === id ? data : t))
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
  }

  const today = sortTasks(tasks.filter(t => t.status === 'today'))
  const upcoming = sortTasks(tasks.filter(t => t.status === 'upcoming'))
  const overdue = sortTasks(tasks.filter(t => t.status === 'overdue'))

  return { tasks, today, upcoming, overdue, loading, error, toggleTask, addTask, updateTask, deleteTask }
}
