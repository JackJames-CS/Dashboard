import { useState, useRef, useEffect } from 'react'
import { useWork } from '../hooks/useWork'
import { useFinances } from '../hooks/useFinances'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'

// ── Utilities ────────────────────────────────────────────────────────────────

function parseHHMM(str) {
  if (!str) return 0
  const [h, m] = str.split(':').map(Number)
  return h + m / 60
}

function shiftHours(shift, breakMinutes = 0) {
  const startH = parseHHMM(shift.start_time)
  let endH = parseHHMM(shift.end_time)
  if (endH <= startH) endH += 24
  return Math.max(0, endH - startH - breakMinutes / 60)
}

function getMonthEarnings(shifts, settings, month) {
  const today = new Date().toISOString().slice(0, 10)
  return shifts
    .filter((s) => {
      const payday = getPaydayThursday(s.shift_date)
      return payday.startsWith(month) && payday <= today
    })
    .reduce((sum, s) => sum + shiftHours(s, settings.break_minutes) * settings.hourly_rate, 0)
}

// Work week: Mon → Sun. Payday: the Thursday after the week ends (Sun + 4 days).
// Mon Mar 2 – Sun Mar 8 → paid Thu Mar 12.
// Given any date, find the Monday of its week, then add 10 days for the payday Thursday.
function getPaydayThursday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const diffToMon = d.getDay() === 0 ? -6 : 1 - d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() + diffToMon)
  const payday = new Date(mon)
  payday.setDate(mon.getDate() + 10) // Mon + 10 = following Thursday
  return payday.toISOString().slice(0, 10)
}

function getPayPeriodLabel(thursdayStr) {
  // Payday Thu = Mon + 10, so Mon = Thu - 10
  const thu = new Date(thursdayStr + 'T12:00:00')
  const mon = new Date(thu)
  mon.setDate(thu.getDate() - 10)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
  return `${fmt(mon)} – ${fmt(sun)}`
}

function fmtMoney(amount, currency = 'EUR') {
  const sym = currency === 'EUR' ? '€' : '$'
  return `${sym}${Math.abs(Number(amount)).toFixed(2)}`
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
}

function monthAdd(month, delta) {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month) {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })
}

// ── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const result = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = '' }
    else cur += ch
  }
  result.push(cur.trim())
  return result
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return null
  return { headers: parseCSVLine(lines[0]), rows: lines.slice(1).map(parseCSVLine) }
}

function parseAmount(str) {
  const n = parseFloat(String(str).replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? 0 : n
}

function parseDateStr(str) {
  if (!str) return new Date().toISOString().slice(0, 10)
  if (str.includes('-') && str.length === 10) {
    const d = new Date(str + 'T12:00:00')
    if (!isNaN(d.getTime())) return str
  }
  const parts = str.split(/[\/\-.]/)
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number)
    if (c > 1900) return `${c}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`
    if (a > 1900) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`
  }
  return new Date().toISOString().slice(0, 10)
}

// ── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATS = ['rent', 'food', 'transport', 'bills', 'entertainment', 'other']

const GOAL_COLORS = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
}

const CAT_COLORS = {
  rent: 'bg-violet-500/20 text-violet-300',
  food: 'bg-emerald-500/20 text-emerald-300',
  transport: 'bg-blue-500/20 text-blue-300',
  bills: 'bg-amber-500/20 text-amber-300',
  entertainment: 'bg-indigo-500/20 text-indigo-300',
  other: 'bg-surface-300/20 text-surface-500',
  income: 'bg-emerald-500/20 text-emerald-300',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl bg-surface-200 border border-surface-300/50 shadow-card p-5">
      <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}

function EarningsReport({ shifts, settings, month }) {
  const today = new Date().toISOString().slice(0, 10)
  // Filter by payday month — a Feb 28 shift paid on Mar 5 belongs in the March report
  const monthShifts = shifts.filter((s) => getPaydayThursday(s.shift_date).startsWith(month))

  // Group by payday Thursday
  const periodMap = {}
  for (const s of monthShifts) {
    const key = getPaydayThursday(s.shift_date)
    if (!periodMap[key]) periodMap[key] = []
    periodMap[key].push(s)
  }
  const periods = Object.keys(periodMap).sort()

  const paidShifts = monthShifts.filter((s) => getPaydayThursday(s.shift_date) <= today)
  const totalPaidHours = paidShifts.reduce((sum, s) => sum + shiftHours(s, settings.break_minutes), 0)
  const totalPaidPay = totalPaidHours * settings.hourly_rate

  return (
    <Card title="Work Earnings" subtitle={monthLabel(month)}>
      {periods.length === 0 ? (
        <p className="text-sm text-surface-500 py-6 text-center">No shifts this month</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-surface-500 uppercase tracking-wider border-b border-surface-300/40">
                <th className="pb-2 text-left font-medium">Work week (Mon–Sun)</th>
                <th className="pb-2 text-center font-medium">Shifts</th>
                <th className="pb-2 text-center font-medium">Hours</th>
                <th className="pb-2 text-right font-medium">Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300/20">
              {periods.map((thuKey) => {
                const ws = periodMap[thuKey]
                const hrs = ws.reduce((s, sh) => s + shiftHours(sh, settings.break_minutes), 0)
                const pay = hrs * settings.hourly_rate
                const isPaid = thuKey <= today
                return (
                  <tr key={thuKey} className={!isPaid ? 'opacity-50' : ''}>
                    <td className="py-2 text-xs">
                      <span className="text-surface-700">{getPayPeriodLabel(thuKey)}</span>
                      {!isPaid && (
                        <span className="ml-2 text-amber-400">· paid {fmtDate(thuKey)}</span>
                      )}
                    </td>
                    <td className="py-2 text-center text-surface-600">{ws.length}</td>
                    <td className="py-2 text-center text-surface-600">{hrs.toFixed(1)}h</td>
                    <td className={`py-2 text-right font-medium font-mono ${isPaid ? 'text-accent-emerald' : 'text-surface-500'}`}>
                      {fmtMoney(pay, settings.currency)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="border-t border-surface-300/40">
              <tr className="font-semibold">
                <td className="pt-2 text-surface-800">Paid total</td>
                <td className="pt-2 text-center text-surface-700">{paidShifts.length}</td>
                <td className="pt-2 text-center text-surface-700">{totalPaidHours.toFixed(1)}h</td>
                <td className="pt-2 text-right text-accent-emerald font-mono">{fmtMoney(totalPaidPay, settings.currency)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  )
}

function CSVImport({ onImport, onCancel }) {
  const [csv, setCsv] = useState(null)
  const [mapping, setMapping] = useState({ date: '', desc: '', amtType: 'single', amt: '', debit: '', credit: '' })
  const [step, setStep] = useState('map')
  const [defaultCat, setDefaultCat] = useState('other')
  const [defaultType, setDefaultType] = useState('expense')
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result)
      if (!parsed) return
      setCsv(parsed)
      const h = parsed.headers
      const find = (...names) =>
        h.find((x) => names.some((n) => x.toLowerCase().includes(n.toLowerCase()))) || ''
      setMapping((prev) => ({
        ...prev,
        date: find('date', 'dated', 'posted'),
        desc: find('desc', 'narration', 'detail', 'reference', 'payee', 'memo'),
        amt: find('amount', 'amt', 'value'),
        debit: find('debit', 'withdrawal', 'dr'),
        credit: find('credit', 'deposit', 'cr'),
      }))
    }
    reader.readAsText(file)
  }

  function getPreviewRows() {
    if (!csv) return []
    return csv.rows.slice(0, 5).map((row) => mapRow(row))
  }

  function mapRow(row) {
    const hi = (col) => csv.headers.indexOf(col)
    const txn_date = parseDateStr(row[hi(mapping.date)] || '')
    const description = row[hi(mapping.desc)] || ''
    let amount = 0
    let type = defaultType
    if (mapping.amtType === 'single') {
      const raw = parseAmount(row[hi(mapping.amt)] || '0')
      amount = Math.abs(raw)
      if (raw < 0) type = 'expense'
      else if (raw > 0) type = defaultType
    } else {
      const debit = parseAmount(row[hi(mapping.debit)] || '0')
      const credit = parseAmount(row[hi(mapping.credit)] || '0')
      if (debit > 0) { amount = debit; type = 'expense' }
      else { amount = credit; type = 'income' }
    }
    return { txn_date, description, amount: parseFloat(amount.toFixed(2)), type, category: defaultCat }
  }

  function buildAllRows() {
    if (!csv) return []
    return csv.rows.map((row) => mapRow(row)).filter((r) => r.amount > 0)
  }

  const selectCls = 'mt-1 w-full bg-surface-200 border border-surface-300/40 rounded text-surface-800 text-xs px-2 py-1.5'

  if (!csv) {
    return (
      <div className="mt-3 p-3 rounded-lg bg-surface-100 border border-surface-300/40">
        <p className="text-xs text-surface-500 mb-2">Select a CSV file from your bank</p>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs bg-surface-300 hover:bg-surface-400 text-surface-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Choose File
          </button>
          <button
            onClick={onCancel}
            className="text-xs text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const preview = getPreviewRows()

  return (
    <div className="mt-3 p-3 rounded-lg bg-surface-100 border border-surface-300/40 space-y-3 text-xs">
      <p className="font-semibold text-surface-700">
        {csv.headers.length} columns · {csv.rows.length} rows detected
      </p>

      {step === 'map' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-surface-500">
              Date column
              <select value={mapping.date} onChange={(e) => setMapping((p) => ({ ...p, date: e.target.value }))} className={selectCls}>
                <option value="">— select —</option>
                {csv.headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
            <label className="text-surface-500">
              Description column
              <select value={mapping.desc} onChange={(e) => setMapping((p) => ({ ...p, desc: e.target.value }))} className={selectCls}>
                <option value="">— select —</option>
                {csv.headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
          </div>

          <div className="space-y-1.5">
            <p className="text-surface-500">Amount format</p>
            <div className="flex gap-4">
              {[
                { v: 'single', label: 'Single column (negative = expense)' },
                { v: 'dual', label: 'Debit / Credit columns (AIB, BOI)' },
              ].map(({ v, label }) => (
                <label key={v} className="flex items-center gap-1.5 text-surface-700 cursor-pointer">
                  <input type="radio" checked={mapping.amtType === v} onChange={() => setMapping((p) => ({ ...p, amtType: v }))} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {mapping.amtType === 'single' ? (
            <label className="text-surface-500 block">
              Amount column
              <select value={mapping.amt} onChange={(e) => setMapping((p) => ({ ...p, amt: e.target.value }))} className={selectCls}>
                <option value="">— select —</option>
                {csv.headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className="text-surface-500">
                Debit column
                <select value={mapping.debit} onChange={(e) => setMapping((p) => ({ ...p, debit: e.target.value }))} className={selectCls}>
                  <option value="">— select —</option>
                  {csv.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
              <label className="text-surface-500">
                Credit column
                <select value={mapping.credit} onChange={(e) => setMapping((p) => ({ ...p, credit: e.target.value }))} className={selectCls}>
                  <option value="">— select —</option>
                  {csv.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="text-surface-500">
              Default category
              <select value={defaultCat} onChange={(e) => setDefaultCat(e.target.value)} className={selectCls}>
                {EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            {mapping.amtType === 'single' && (
              <label className="text-surface-500">
                Positive amounts are
                <select value={defaultType} onChange={(e) => setDefaultType(e.target.value)} className={selectCls}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('preview')}
              className="bg-accent-indigo hover:bg-accent-indigo/80 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Preview →
            </button>
            <button onClick={onCancel} className="text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 'preview' && (
        <>
          <p className="text-surface-500">Preview (first 5 rows):</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-surface-500 border-b border-surface-300/40">
                  <th className="pb-1 text-left font-medium">Date</th>
                  <th className="pb-1 text-left font-medium">Description</th>
                  <th className="pb-1 text-left font-medium">Category</th>
                  <th className="pb-1 text-right font-medium">Amount</th>
                  <th className="pb-1 text-right font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-b border-surface-300/20">
                    <td className="py-1 text-surface-700">{r.txn_date}</td>
                    <td className="py-1 text-surface-700 max-w-[140px] truncate">{r.description}</td>
                    <td className="py-1 text-surface-600">{r.category}</td>
                    <td className="py-1 text-right font-mono text-surface-700">{r.amount}</td>
                    <td className={`py-1 text-right ${r.type === 'expense' ? 'text-red-400' : 'text-accent-emerald'}`}>{r.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-surface-500">Will import {buildAllRows().length} of {csv.rows.length} rows.</p>
          <div className="flex gap-2">
            <button
              onClick={() => onImport(buildAllRows())}
              className="bg-accent-emerald/80 hover:bg-accent-emerald text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Confirm import
            </button>
            <button onClick={() => setStep('map')} className="text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg transition-colors">
              ← Back
            </button>
            <button onClick={onCancel} className="text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function TransactionsCard({ transactions, addTransaction, bulkAddTransactions, deleteTransaction, month, currency }) {
  const today = new Date().toISOString().slice(0, 10)
  const [showForm, setShowForm] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  const [form, setForm] = useState({ txn_date: today, description: '', amount: '', category: 'other', type: 'expense' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.description || !form.amount) return
    setSaving(true)
    await addTransaction(form)
    setForm({ txn_date: today, description: '', amount: '', category: 'other', type: 'expense' })
    setSaving(false)
    setShowForm(false)
  }

  async function handleImport(rows) {
    await bulkAddTransactions(rows)
    setShowCSV(false)
  }

  const inputCls = 'bg-surface-100 border border-surface-300/40 rounded text-surface-800 text-xs px-2 py-1.5'

  return (
    <Card
      title="Transactions"
      subtitle={monthLabel(month)}
      action={
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCSV(!showCSV); setShowForm(false) }}
            className="text-xs text-surface-600 hover:text-surface-800 bg-surface-300/50 hover:bg-surface-300 px-2.5 py-1 rounded-lg transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowCSV(false) }}
            className="text-xs text-white bg-accent-indigo hover:bg-accent-indigo/80 px-2.5 py-1 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-lg bg-surface-100 border border-surface-300/40 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={form.txn_date}
              onChange={(e) => setForm((p) => ({ ...p, txn_date: e.target.value }))}
              className={inputCls}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              className={inputCls}
            />
          </div>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className={`w-full ${inputCls}`}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className={inputCls}
            >
              {EXPENSE_CATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex rounded overflow-hidden border border-surface-300/40 text-xs">
              {['expense', 'income'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type: t }))}
                  className={`flex-1 py-1.5 transition-colors capitalize ${form.type === t ? 'bg-accent-indigo text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="text-xs bg-accent-indigo text-white px-3 py-1.5 rounded-lg hover:bg-accent-indigo/80 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showCSV && <CSVImport onImport={handleImport} onCancel={() => setShowCSV(false)} />}

      {transactions.length === 0 ? (
        <p className="text-sm text-surface-500 py-6 text-center">No transactions this month</p>
      ) : (
        <div className="space-y-0 max-h-96 overflow-y-auto">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-2 py-2 border-b border-surface-300/20 last:border-0">
              <span className="text-xs text-surface-500 w-14 shrink-0">{fmtDate(t.txn_date)}</span>
              <span className={`text-xs flex-1 truncate min-w-0 ${t.type === 'expense' ? 'text-surface-700' : 'text-accent-emerald'}`}>
                {t.description}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded capitalize shrink-0 ${CAT_COLORS[t.category] || CAT_COLORS.other}`}>
                {t.category}
              </span>
              <span className={`text-xs font-medium font-mono w-20 text-right shrink-0 ${t.type === 'expense' ? 'text-red-400' : 'text-accent-emerald'}`}>
                {t.type === 'expense' ? '-' : '+'}{fmtMoney(t.amount, currency)}
              </span>
              <button
                onClick={() => deleteTransaction(t.id)}
                className="text-surface-400 hover:text-red-400 transition-colors shrink-0"
                aria-label="Delete"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function BudgetCard({ budgetItems, spending, addBudgetItem, deleteBudgetItem, itemMonthlyAmount, getCategoryBudget, currency }) {
  const [openCats, setOpenCats] = useState(new Set())
  const [addingTo, setAddingTo] = useState(null)
  const [itemForm, setItemForm] = useState({ name: '', amount: '', frequency: 'monthly' })
  const [saving, setSaving] = useState(false)

  function toggleCat(cat) {
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  async function handleAddItem(cat) {
    if (!itemForm.name || !itemForm.amount) return
    setSaving(true)
    await addBudgetItem({ category: cat, name: itemForm.name, amount: itemForm.amount, frequency: itemForm.frequency })
    setItemForm({ name: '', amount: '', frequency: 'monthly' })
    setAddingTo(null)
    setSaving(false)
  }

  const iCls = 'bg-surface-200 border border-surface-300/40 rounded text-surface-800 text-xs px-2 py-1'

  return (
    <Card title="Budget" subtitle="This month · click a category to expand">
      <div className="space-y-1">
        {EXPENSE_CATS.map((cat) => {
          const items = budgetItems.filter((i) => i.category === cat)
          const budget = getCategoryBudget(cat)
          const spent = spending[cat] || 0
          const pct = budget > 0 ? (spent / budget) * 100 : 0
          const cappedPct = Math.min(pct, 100)
          const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-400'
          const isOpen = openCats.has(cat)

          return (
            <div key={cat} className="border border-surface-300/30 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-surface-100/60 transition-colors text-left"
              >
                <span className="text-sm capitalize text-surface-700 w-24 shrink-0">{cat}</span>
                <span className="text-sm font-mono text-surface-600 shrink-0">{fmtMoney(spent, currency)}</span>
                {budget > 0 ? (
                  <>
                    <span className="text-xs text-surface-400">/</span>
                    <span className="text-sm font-mono text-surface-500 shrink-0">{fmtMoney(budget, currency)}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-300 overflow-hidden mx-1">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${cappedPct}%` }} />
                    </div>
                    <span className="text-xs text-surface-400 shrink-0">{Math.round(pct)}%</span>
                  </>
                ) : (
                  <span className="flex-1 text-xs text-surface-400 italic">no budget set · click to add items</span>
                )}
                <span className="text-surface-400 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="border-t border-surface-300/30 bg-surface-100/40 px-3 py-2 space-y-1.5">
                  {items.length === 0 && (
                    <p className="text-xs text-surface-400 py-0.5 italic">No items yet</p>
                  )}
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 text-surface-700">{item.name}</span>
                      <span className="font-mono text-surface-600">{fmtMoney(item.amount, currency)}</span>
                      <span className={`px-1.5 py-0.5 rounded ${item.frequency === 'weekly' ? 'bg-blue-500/20 text-blue-300' : 'bg-surface-300/40 text-surface-500'}`}>
                        {item.frequency}
                      </span>
                      {item.frequency === 'weekly' && (
                        <span className="text-surface-400">≈ {fmtMoney(itemMonthlyAmount(item), currency)}/mo</span>
                      )}
                      <button onClick={() => deleteBudgetItem(item.id)} className="text-surface-400 hover:text-red-400 transition-colors">×</button>
                    </div>
                  ))}

                  {addingTo === cat ? (
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={itemForm.name}
                        onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
                        className={`flex-1 min-w-24 ${iCls}`}
                        autoFocus
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        value={itemForm.amount}
                        onChange={(e) => setItemForm((p) => ({ ...p, amount: e.target.value }))}
                        className={`w-20 ${iCls}`}
                      />
                      <div className="flex rounded overflow-hidden border border-surface-300/40 text-xs">
                        {['monthly', 'weekly'].map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setItemForm((p) => ({ ...p, frequency: f }))}
                            className={`px-2 py-1 transition-colors ${itemForm.frequency === f ? 'bg-accent-indigo text-white' : 'bg-surface-200 text-surface-600 hover:bg-surface-300'}`}
                          >
                            {f === 'monthly' ? 'mo' : 'wk'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAddItem(cat)}
                        disabled={saving}
                        className="text-xs bg-accent-indigo text-white px-2.5 py-1 rounded transition-colors hover:bg-accent-indigo/80 disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button onClick={() => setAddingTo(null)} className="text-xs text-surface-400 hover:text-surface-600 px-1">×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingTo(cat); setItemForm({ name: '', amount: '', frequency: 'monthly' }) }}
                      className="text-xs text-accent-indigo hover:text-accent-indigo/80 py-0.5 transition-colors"
                    >
                      + Add item
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SavingsGoals({ savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, currency }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target_amount: '', saved_amount: '', deadline: '', color: 'emerald', notes: '' })
  const [saving, setSaving] = useState(false)
  const [contributing, setContributing] = useState(null)
  const [contribution, setContribution] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name || !form.target_amount) return
    setSaving(true)
    await addSavingsGoal(form)
    setForm({ name: '', target_amount: '', saved_amount: '', deadline: '', color: 'emerald', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleContribute(goal) {
    const amount = parseFloat(contribution)
    if (isNaN(amount) || amount <= 0) return
    await updateSavingsGoal(goal.id, { saved_amount: parseFloat(goal.saved_amount) + amount })
    setContributing(null)
    setContribution('')
  }

  const iCls = 'bg-surface-100 border border-surface-300/40 rounded text-surface-800 text-xs px-2 py-1.5'

  return (
    <Card
      title="Savings & Goals"
      subtitle="Saving for something or paying off debt"
      action={
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-white bg-accent-indigo hover:bg-accent-indigo/80 px-2.5 py-1 rounded-lg transition-colors"
        >
          + New goal
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 p-3 rounded-lg bg-surface-100 border border-surface-300/40 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Goal name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={iCls} required />
            <input type="number" step="0.01" min="0" placeholder="Target amount" value={form.target_amount} onChange={(e) => setForm((p) => ({ ...p, target_amount: e.target.value }))} className={iCls} required />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" step="0.01" min="0" placeholder="Already saved (optional)" value={form.saved_amount} onChange={(e) => setForm((p) => ({ ...p, saved_amount: e.target.value }))} className={iCls} />
            <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} className={iCls} />
            <select value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} className={iCls}>
              {Object.keys(GOAL_COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className={`w-full ${iCls}`} />
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="text-xs bg-accent-indigo text-white px-3 py-1.5 rounded-lg hover:bg-accent-indigo/80 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Add goal'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {savingsGoals.length === 0 ? (
        <p className="text-sm text-surface-500 py-4 text-center">No goals yet — add something you're saving for or paying off</p>
      ) : (
        <div className="space-y-5">
          {savingsGoals.map((goal) => {
            const saved = parseFloat(goal.saved_amount)
            const target = parseFloat(goal.target_amount)
            const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0
            const remaining = Math.max(0, target - saved)
            const barColor = GOAL_COLORS[goal.color] || GOAL_COLORS.emerald

            return (
              <div key={goal.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium text-surface-800 flex-1">{goal.name}</span>
                  {goal.deadline && <span className="text-xs text-surface-400">{fmtDate(goal.deadline)}</span>}
                  <span className="text-xs font-mono text-surface-600">
                    {fmtMoney(saved, currency)} / {fmtMoney(target, currency)}
                  </span>
                  <button
                    onClick={() => { setContributing(goal.id); setContribution('') }}
                    className="text-xs text-accent-indigo hover:text-accent-indigo/80 shrink-0"
                  >
                    + add
                  </button>
                  <button onClick={() => deleteSavingsGoal(goal.id)} className="text-surface-400 hover:text-red-400 transition-colors text-sm shrink-0">×</button>
                </div>
                <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-surface-400">{Math.round(pct)}% complete</span>
                  <span className="text-xs text-surface-400">{fmtMoney(remaining, currency)} to go</span>
                </div>
                {goal.notes && <p className="text-xs text-surface-400 mt-0.5 italic">{goal.notes}</p>}
                {contributing === goal.id && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleContribute(goal)}
                      className="w-28 bg-surface-100 border border-surface-300/40 rounded text-surface-800 text-xs px-2 py-1 font-mono"
                      autoFocus
                    />
                    <button onClick={() => handleContribute(goal)} className="text-xs bg-accent-emerald/80 text-white px-3 py-1 rounded-lg hover:bg-accent-emerald transition-colors">Add</button>
                    <button onClick={() => setContributing(null)} className="text-xs text-surface-400 hover:text-surface-600 px-2 py-1">Cancel</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function PayslipsCard({ payslips, addPayslip, currency }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ pay_date: '', net_pay: '', gross_pay: '', notes: '' })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const fileRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.pay_date || !form.net_pay) return
    setSaving(true)
    setErr(null)
    const error = await addPayslip({ ...form, file })
    if (error) {
      setErr(error.message)
    } else {
      setForm({ pay_date: '', net_pay: '', gross_pay: '', notes: '' })
      setFile(null)
      setShowForm(false)
    }
    setSaving(false)
  }

  const inputCls = 'bg-surface-100 border border-surface-300/40 rounded text-surface-800 text-xs px-2 py-1.5'

  return (
    <Card
      title="Payslips"
      action={
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-white bg-accent-indigo hover:bg-accent-indigo/80 px-2.5 py-1 rounded-lg transition-colors"
        >
          + Upload
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 rounded-lg bg-surface-100 border border-surface-300/40 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="date"
              value={form.pay_date}
              onChange={(e) => setForm((p) => ({ ...p, pay_date: e.target.value }))}
              className={inputCls}
              required
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Net pay"
              value={form.net_pay}
              onChange={(e) => setForm((p) => ({ ...p, net_pay: e.target.value }))}
              className={inputCls}
              required
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Gross (optional)"
              value={form.gross_pay}
              onChange={(e) => setForm((p) => ({ ...p, gross_pay: e.target.value }))}
              className={inputCls}
            />
          </div>
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className={`w-full ${inputCls}`}
          />
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs bg-surface-200 hover:bg-surface-300 text-surface-700 px-3 py-1.5 rounded-lg transition-colors border border-surface-300/40"
            >
              {file ? file.name : 'Choose PDF / image'}
            </button>
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="text-xs bg-accent-indigo text-white px-3 py-1.5 rounded-lg hover:bg-accent-indigo/80 transition-colors disabled:opacity-50"
            >
              {saving ? 'Uploading…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-surface-500 hover:text-surface-700 px-3 py-1.5 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {payslips.length === 0 ? (
        <p className="text-sm text-surface-500 py-4 text-center">No payslips uploaded</p>
      ) : (
        <div className="divide-y divide-surface-300/20">
          {payslips.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-3">
              <span className="text-xs text-surface-500 w-20 shrink-0">{fmtDate(p.pay_date)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-surface-800 font-medium font-mono">
                  Net: {fmtMoney(p.net_pay, currency)}
                  {p.gross_pay ? ` · Gross: ${fmtMoney(p.gross_pay, currency)}` : ''}
                </p>
                {p.notes && <p className="text-xs text-surface-500 truncate mt-0.5">{p.notes}</p>}
              </div>
              {p.file_url && (
                <a
                  href={p.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-indigo hover:text-accent-indigo/80 shrink-0"
                >
                  View PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Finances() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const { shifts, settings, loading: workLoading, error: workError } = useWork()
  const {
    payslips,
    budgetItems,
    savingsGoals,
    loading: finLoading,
    error: finError,
    addTransaction,
    bulkAddTransactions,
    deleteTransaction,
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
  } = useFinances()

  const monthTxns = getMonthTransactions(selectedMonth)
  const monthExpenses = monthTxns
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + parseFloat(t.amount), 0)
  const monthIncome = monthTxns
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.amount), 0)
  const monthEarnings = getMonthEarnings(shifts, settings, selectedMonth)
  const net = monthEarnings + monthIncome - monthExpenses
  const currency = settings.currency

  const loading = workLoading || finLoading
  const error = workError || finError

  return (
    <div className="p-6 space-y-6">
      {/* Header + month navigator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Finances</h1>
          <p className="text-sm text-surface-500 mt-0.5">Earnings, spending & budgets</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-200 border border-surface-300/50 rounded-xl px-4 py-2">
          <button
            onClick={() => setSelectedMonth(monthAdd(selectedMonth, -1))}
            className="text-surface-500 hover:text-surface-800 transition-colors text-lg leading-none"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-surface-800 w-36 text-center">
            {monthLabel(selectedMonth)}
          </span>
          <button
            onClick={() => setSelectedMonth(monthAdd(selectedMonth, 1))}
            className="text-surface-500 hover:text-surface-800 transition-colors text-lg leading-none"
          >
            →
          </button>
        </div>
      </div>

      <DataState loading={loading} error={error}>
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Work Earnings"
              value={fmtMoney(monthEarnings, currency)}
              color="text-accent-emerald"
            />
            <StatCard
              label="Expenses"
              value={fmtMoney(monthExpenses, currency)}
              color="text-red-400"
            />
            <StatCard
              label="Net"
              value={`${net < 0 ? '-' : ''}${fmtMoney(Math.abs(net), currency)}`}
              color={net >= 0 ? 'text-accent-emerald' : 'text-red-400'}
            />
          </div>

          {/* Earnings report + Transactions */}
          <div className="grid grid-cols-2 gap-6">
            <EarningsReport shifts={shifts} settings={settings} month={selectedMonth} />
            <TransactionsCard
              transactions={monthTxns}
              addTransaction={addTransaction}
              bulkAddTransactions={bulkAddTransactions}
              deleteTransaction={deleteTransaction}
              month={selectedMonth}
              currency={currency}
            />
          </div>

          {/* Budget — always current month */}
          <BudgetCard
            budgetItems={budgetItems}
            spending={getSpendingByCategory(currentMonth)}
            addBudgetItem={addBudgetItem}
            deleteBudgetItem={deleteBudgetItem}
            itemMonthlyAmount={itemMonthlyAmount}
            getCategoryBudget={getCategoryBudget}
            currency={currency}
          />

          {/* Savings & Goals */}
          <SavingsGoals
            savingsGoals={savingsGoals}
            addSavingsGoal={addSavingsGoal}
            updateSavingsGoal={updateSavingsGoal}
            deleteSavingsGoal={deleteSavingsGoal}
            currency={currency}
          />

          {/* Payslips */}
          <PayslipsCard payslips={payslips} addPayslip={addPayslip} currency={currency} />
        </>
      </DataState>
    </div>
  )
}
