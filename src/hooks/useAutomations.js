import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for browser-side reads — RLS allows authenticated users
const supabase = createClient(
  'https://xhajteuoxkmqjwvprzdv.supabase.co',
  'sb_publishable_0CYnxEOCYWOFbcEpjsJLXA_3VzfU0oz'
)

export function useAutomations() {
  const [automations, setAutomations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  const fetchAutomations = useCallback(async () => {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setAutomations(data)
      setError(null)
    }
    setLoading(false)
  }, [])

  // Initial fetch + poll every 30 seconds
  useEffect(() => {
    fetchAutomations()
    const interval = setInterval(fetchAutomations, 30_000)
    return () => clearInterval(interval)
  }, [fetchAutomations])

  // Set trigger_now = true so the VPS poller picks it up
  async function triggerNow(id) {
    const { error } = await supabase
      .from('automations')
      .update({ trigger_now: true, status: 'running' })
      .eq('id', id)

    if (error) {
      console.error('Failed to trigger automation:', error.message)
      return false
    }

    // Optimistic update so the UI reacts immediately
    setAutomations(prev =>
      prev.map(a => a.id === id ? { ...a, trigger_now: true, status: 'running' } : a)
    )
    return true
  }

  return { automations, loading, error, refresh: fetchAutomations, triggerNow }
}
