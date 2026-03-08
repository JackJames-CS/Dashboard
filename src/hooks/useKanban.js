import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
]

export function useKanban() {
  const [kanbanColumns, setKanbanColumns] = useState(
    COLUMNS.map((col) => ({ ...col, tasks: [] }))
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchKanban() }, [])

  async function fetchKanban() {
    const { data, error } = await supabase
      .from('kanban_tasks')
      .select('*')
      .order('position', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setKanbanColumns(
        COLUMNS.map((col) => ({
          ...col,
          tasks: data.filter((t) => t.column_id === col.id),
        }))
      )
    }
    setLoading(false)
  }

  async function addTask(title, columnId, project = '') {
    const { data, error } = await supabase
      .from('kanban_tasks')
      .insert({ title, column_id: columnId, project })
      .select()
      .single()
    if (!error) {
      setKanbanColumns(prev => prev.map(col =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, data] } : col
      ))
    }
  }

  async function moveTask(taskId, newColumnId) {
    const { error } = await supabase
      .from('kanban_tasks')
      .update({ column_id: newColumnId })
      .eq('id', taskId)
    if (!error) {
      setKanbanColumns((prev) => {
        const task = prev.flatMap((c) => c.tasks).find((t) => t.id === taskId)
        return prev.map((col) => {
          if (col.id === newColumnId) return { ...col, tasks: [...col.tasks, { ...task, column_id: newColumnId }] }
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        })
      })
    }
  }

  async function deleteTask(taskId) {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', taskId)
    if (!error) {
      setKanbanColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId),
      })))
    }
  }

  return { kanbanColumns, loading, error, addTask, moveTask, deleteTask }
}
