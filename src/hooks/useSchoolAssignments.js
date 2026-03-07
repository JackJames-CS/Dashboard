import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSchoolAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAssignments() {
      const { data, error } = await supabase
        .from('school_assignments')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) setError(error.message)
      else setAssignments(data)
      setLoading(false)
    }
    fetchAssignments()
  }, [])

  async function updateProgress(id, progress) {
    const { error } = await supabase.from('school_assignments').update({ progress }).eq('id', id)
    if (!error) setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, progress } : a)))
  }

  return { assignments, loading, error, updateProgress }
}
