import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
        // Map snake_case DB columns to camelCase for components
        setProjects(
          data.map((p) => ({
            ...p,
            tasksLeft: p.tasks_left,
            lastActivity: p.last_activity,
          }))
        )
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  return { projects, loading, error }
}
