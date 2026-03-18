import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDeadlines() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDeadlines() {
      const { data, error } = await supabase.functions.invoke('fetch-ical-deadlines')
      if (error) setError(error.message)
      else setDeadlines(data ?? [])
      setLoading(false)
    }
    fetchDeadlines()
  }, [])

  return { deadlines, loading, error }
}
