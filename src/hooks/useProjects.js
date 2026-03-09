import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) {
        setError(error.message)
      } else {
        const mapped = data.map((p) => ({
          ...p,
          tasksLeft: p.tasks_left,
          lastActivity: p.last_activity,
          priority: p.priority ?? 'medium',
        }))
        mapped.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
        setProjects(mapped)
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  async function updatePriority(id, priority) {
    const { error } = await supabase
      .from('projects')
      .update({ priority })
      .eq('id', id)
    if (!error) {
      setProjects(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, priority } : p)
        updated.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
        return updated
      })
    }
  }

  async function createProject({ name, color, priority }) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, color, priority, progress: 0, tasks_left: 0, last_activity: 'just now' })
      .select()
      .single()
    if (!error) {
      const mapped = { ...data, tasksLeft: data.tasks_left, lastActivity: data.last_activity, priority: data.priority ?? 'medium' }
      setProjects(prev => {
        const updated = [...prev, mapped]
        updated.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
        return updated
      })
    }
    return { error }
  }

  async function deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  return { projects, loading, error, updatePriority, createProject, deleteProject }
}
