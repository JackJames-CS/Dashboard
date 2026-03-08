import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFinances() {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [budgetItems, setBudgetItems] = useState([])
  const [savingsGoals, setSavingsGoals] = useState([])
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [txnRes, budgetRes, itemsRes, goalsRes, payslipRes] = await Promise.all([
      supabase.from('transactions').select('*').order('txn_date', { ascending: false }),
      supabase.from('budgets').select('*'),
      supabase.from('budget_items').select('*').order('category').order('created_at'),
      supabase.from('savings_goals').select('*').order('created_at'),
      supabase.from('payslips').select('*').order('pay_date', { ascending: false }),
    ])
    if (txnRes.error) setError(txnRes.error.message)
    else setTransactions(txnRes.data || [])
    setBudgets(budgetRes.data || [])
    setBudgetItems(itemsRes.data || [])
    setSavingsGoals(goalsRes.data || [])
    setPayslips(payslipRes.data || [])
    setLoading(false)
  }

  async function addTransaction({ txn_date, description, amount, category, type }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ txn_date, description, amount: parseFloat(amount), category, type })
      .select()
      .single()
    if (!error) setTransactions((prev) => [data, ...prev])
    return error
  }

  async function bulkAddTransactions(rows) {
    const { data, error } = await supabase.from('transactions').insert(rows).select()
    if (!error && data) {
      setTransactions((prev) =>
        [...data, ...prev].sort((a, b) => b.txn_date.localeCompare(a.txn_date))
      )
    }
    return error
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  async function upsertBudget({ category, month, limit_amount }) {
    const { data, error } = await supabase
      .from('budgets')
      .upsert({ category, month, limit_amount: parseFloat(limit_amount) }, { onConflict: 'category,month' })
      .select()
      .single()
    if (!error && data) {
      setBudgets((prev) => {
        const idx = prev.findIndex((b) => b.category === category && b.month === month)
        if (idx >= 0) { const next = [...prev]; next[idx] = data; return next }
        return [...prev, data]
      })
    }
    return error
  }

  async function addPayslip({ pay_date, net_pay, gross_pay, notes, file }) {
    let file_url = null
    if (file) {
      const fileName = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('payslips')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })
      if (uploadError) return uploadError
      const { data: urlData } = supabase.storage.from('payslips').getPublicUrl(fileName)
      file_url = urlData.publicUrl
    }
    const { data, error } = await supabase
      .from('payslips')
      .insert({
        pay_date,
        net_pay: parseFloat(net_pay),
        gross_pay: gross_pay ? parseFloat(gross_pay) : null,
        notes: notes || '',
        file_url,
      })
      .select()
      .single()
    if (!error) setPayslips((prev) => [data, ...prev])
    return error
  }

  function getMonthTransactions(month) {
    return transactions.filter((t) => t.txn_date && t.txn_date.startsWith(month))
  }

  async function addBudgetItem({ category, name, amount, frequency }) {
    const { data, error } = await supabase
      .from('budget_items')
      .insert({ category, name, amount: parseFloat(amount), frequency })
      .select()
      .single()
    if (!error) setBudgetItems((prev) => [...prev, data])
    return error
  }

  async function deleteBudgetItem(id) {
    const { error } = await supabase.from('budget_items').delete().eq('id', id)
    if (!error) setBudgetItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function addSavingsGoal({ name, target_amount, saved_amount, deadline, color, notes }) {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ name, target_amount: parseFloat(target_amount), saved_amount: parseFloat(saved_amount || 0), deadline: deadline || null, color: color || 'blue', notes: notes || '' })
      .select()
      .single()
    if (!error) setSavingsGoals((prev) => [...prev, data])
    return error
  }

  async function updateSavingsGoal(id, updates) {
    const { data, error } = await supabase.from('savings_goals').update(updates).eq('id', id).select().single()
    if (!error) setSavingsGoals((prev) => prev.map((g) => g.id === id ? data : g))
    return error
  }

  async function deleteSavingsGoal(id) {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (!error) setSavingsGoals((prev) => prev.filter((g) => g.id !== id))
  }

  // Monthly equivalent of a budget item
  function itemMonthlyAmount(item) {
    return item.frequency === 'weekly' ? item.amount * (52 / 12) : item.amount
  }

  // Total monthly budget for a category from its items
  function getCategoryBudget(category) {
    return budgetItems
      .filter((i) => i.category === category)
      .reduce((sum, i) => sum + itemMonthlyAmount(i), 0)
  }

  function getSpendingByCategory(month) {
    const result = {}
    for (const t of transactions) {
      if (t.type === 'expense' && t.txn_date && t.txn_date.startsWith(month)) {
        result[t.category] = (result[t.category] || 0) + parseFloat(t.amount)
      }
    }
    return result
  }

  return {
    transactions,
    budgets,
    budgetItems,
    savingsGoals,
    payslips,
    loading,
    error,
    addTransaction,
    bulkAddTransactions,
    deleteTransaction,
    upsertBudget,
    addBudgetItem,
    deleteBudgetItem,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    itemMonthlyAmount,
    getCategoryBudget,
    addPayslip,
    getMonthTransactions,
    getSpendingByCategory,
  }
}
