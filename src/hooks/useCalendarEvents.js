import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCalendarEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('day', { ascending: true })
      if (error) setError(error.message)
      else setEvents(data)
      setLoading(false)
    }
    fetchEvents()
  }, [])

  return { events, loading, error }
}
