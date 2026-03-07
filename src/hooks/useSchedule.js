import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSchedule(date) {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchSchedule() {
      const today = date || new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('day_date', today)
        .order('time', { ascending: true })
      if (error) setError(error.message)
      else setSchedule(data)
      setLoading(false)
    }
    fetchSchedule()
  }, [date])

  return { schedule, loading, error }
}
