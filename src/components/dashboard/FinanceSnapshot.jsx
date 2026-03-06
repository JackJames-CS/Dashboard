import Card from '../ui/Card'
import { financeSnapshot } from '../../data/mockData'

export default function FinanceSnapshot() {
  const balance = financeSnapshot.monthlyIncome - financeSnapshot.monthlySpending
  return (
    <Card title="Finance" subtitle="This month">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-surface-500">Income</span>
          <span className="text-sm font-semibold text-accent-emerald">${financeSnapshot.monthlyIncome}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-surface-500">Spending</span>
          <span className="text-sm font-semibold text-surface-800">${financeSnapshot.monthlySpending}</span>
        </div>
        <div className="pt-2 border-t border-surface-100 flex justify-between items-center">
          <span className="text-sm font-medium text-surface-700">Remaining</span>
          <span className={`text-sm font-semibold ${balance >= 0 ? 'text-accent-emerald' : 'text-red-600'}`}>${balance}</span>
        </div>
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
