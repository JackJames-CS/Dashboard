import Card from '../ui/Card'
import { useWork } from '../../hooks/useWork'
import { useFinances } from '../../hooks/useFinances'
import { financeSnapshot } from '../../data/mockData'

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

function getPaydayThursday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const diffToMon = d.getDay() === 0 ? -6 : 1 - d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() + diffToMon)
  const payday = new Date(mon)
  payday.setDate(mon.getDate() + 10)
  return payday.toISOString().slice(0, 10)
}

export default function FinanceSnapshot() {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { shifts, settings, loading: workLoading } = useWork()
  const { getMonthTransactions, getSpendingByCategory, loading: finLoading } = useFinances()

  const loading = workLoading || finLoading

  const today = new Date().toISOString().slice(0, 10)
  const monthEarnings = shifts
    .filter((s) => {
      const payday = getPaydayThursday(s.shift_date)
      return payday.startsWith(currentMonth) && payday <= today
    })
    .reduce((sum, s) => sum + shiftHours(s, settings.break_minutes) * settings.hourly_rate, 0)

  const monthExpenses = Object.values(getSpendingByCategory(currentMonth)).reduce((s, v) => s + v, 0)

  const monthIncome = getMonthTransactions(currentMonth)
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.amount), 0)

  const net = monthEarnings + monthIncome - monthExpenses
  const sym = settings.currency === 'EUR' ? '€' : '$'

  return (
    <Card title="Finance" subtitle="This month">
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-4 h-4 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Earnings</span>
              <span className="text-sm font-semibold font-mono text-accent-emerald">
                {sym}{monthEarnings.toFixed(2)}
              </span>
            </div>
            {monthIncome > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Other income</span>
                <span className="text-sm font-semibold font-mono text-accent-emerald">
                  {sym}{monthIncome.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-surface-500">Spending</span>
              <span className="text-sm font-semibold font-mono text-surface-800">
                {sym}{monthExpenses.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-surface-100 flex justify-between items-center">
              <span className="text-sm font-medium text-surface-700">Net</span>
              <span className={`text-sm font-semibold font-mono ${net >= 0 ? 'text-accent-emerald' : 'text-red-400'}`}>
                {net < 0 ? '-' : ''}{sym}{Math.abs(net).toFixed(2)}
              </span>
            </div>
          </>
        )}
        <div>
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upcoming bills</h4>
          <ul className="space-y-1.5">
            {financeSnapshot.upcomingBills.map((b, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-surface-700">{b.name}</span>
                <span className="text-surface-600">${b.amount} · {b.due}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
