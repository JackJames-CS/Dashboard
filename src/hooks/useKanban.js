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

  useEffect(() => {
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
    fetchKanban()
  }, [])

  async function moveTask(taskId, newColumnId) {
    const { error } = await supabase
      .from('kanban_tasks')
      .update({ column_id: newColumnId })
      .eq('id', taskId)
    if (!error) {
      setKanbanColumns((prev) =>
        prev.map((col) => {
          if (col.id === newColumnId) {
            const task = prev.flatMap((c) => c.tasks).find((t) => t.id === taskId)
            if (task) return { ...col, tasks: [...col.tasks, { ...task, column_id: newColumnId }] }
          }
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        })
      )
    }
  }

  return { kanbanColumns, loading, error, moveTask }
}
