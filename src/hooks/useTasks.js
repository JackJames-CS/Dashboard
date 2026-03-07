import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setTasks(data)
    setLoading(false)
  }

  async function toggleTask(id, done) {
    const { error } = await supabase.from('tasks').update({ done }).eq('id', id)
    if (!error) setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)))
  }

  async function addTask(title, status = 'today', category = 'personal') {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, status, category })
      .select()
      .single()
    if (!error) setTasks((prev) => [...prev, data])
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const today = tasks.filter((t) => t.status === 'today')
  const upcoming = tasks.filter((t) => t.status === 'upcoming')
  const overdue = tasks.filter((t) => t.status === 'overdue')

  return { tasks, today, upcoming, overdue, loading, error, toggleTask, addTask, deleteTask }
}
