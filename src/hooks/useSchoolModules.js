import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function calculateOverall(mod) {
  const caWeight = 100 - mod.exam_weight
  if (mod.exam_weight === 0) return mod.ca_mark ?? null
  if (mod.exam_weight === 100) return mod.exam_mark ?? null
  if (mod.exam_mark != null && mod.ca_mark != null) {
    return (mod.exam_mark * mod.exam_weight / 100) + (mod.ca_mark * caWeight / 100)
  }
  return null
}

export function classify(pct) {
  if (pct == null) return null
  if (pct >= 70) return { label: 'First', color: 'text-accent-amber', bg: 'bg-accent-amber/10 border-accent-amber/30' }
  if (pct >= 60) return { label: '2.1',   color: 'text-accent-emerald', bg: 'bg-accent-emerald/10 border-accent-emerald/30' }
  if (pct >= 50) return { label: '2.2',   color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/30' }
  if (pct >= 40) return { label: 'Pass',  color: 'text-surface-600', bg: 'bg-surface-300/50 border-surface-300' }
  return { label: 'Fail', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/30' }
}

export function useSchoolModules() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchModules() }, [])

  async function fetchModules() {
    setLoading(true)
    const { data, error } = await supabase
      .from('school_modules')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setModules(data)
    setLoading(false)
  }

  async function addModule(mod) {
    const { data, error } = await supabase
      .from('school_modules')
      .insert(mod)
      .select()
      .single()
    if (!error) setModules(prev => [...prev, data])
  }

  async function updateModule(id, updates) {
    const { data, error } = await supabase
      .from('school_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setModules(prev => prev.map(m => m.id === id ? data : m))
  }

  async function deleteModule(id) {
    const { error } = await supabase.from('school_modules').delete().eq('id', id)
    if (!error) setModules(prev => prev.filter(m => m.id !== id))
  }

  const modulesWithOverall = modules.map(m => ({
    ...m,
    caWeight: 100 - m.exam_weight,
    overall: calculateOverall(m),
  }))

  const graded = modulesWithOverall.filter(m => m.overall != null)
  const totalCredits = graded.reduce((sum, m) => sum + Number(m.credits), 0)
  const qca = totalCredits > 0
    ? graded.reduce((sum, m) => sum + m.overall * Number(m.credits), 0) / totalCredits
    : null

  return { modules: modulesWithOverall, qca, loading, error, addModule, updateModule, deleteModule }
}
