import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSchoolAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchAssignments() }, [])

  async function fetchAssignments() {
    setLoading(true)
    const { data, error } = await supabase
      .from('school_assignments')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setAssignments(data)
    setLoading(false)
  }

  async function addAssignment(assignment) {
    const { data, error } = await supabase
      .from('school_assignments')
      .insert(assignment)
      .select()
      .single()
    if (!error) setAssignments(prev => [...prev, data])
  }

  async function updateProgress(id, progress) {
    const { error } = await supabase.from('school_assignments').update({ progress }).eq('id', id)
    if (!error) setAssignments(prev => prev.map(a => a.id === id ? { ...a, progress } : a))
  }

  async function deleteAssignment(id) {
    const { error } = await supabase.from('school_assignments').delete().eq('id', id)
    if (!error) setAssignments(prev => prev.filter(a => a.id !== id))
  }

  return { assignments, loading, error, addAssignment, updateProgress, deleteAssignment }
}
