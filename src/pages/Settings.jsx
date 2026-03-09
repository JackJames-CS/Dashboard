import { useState } from 'react'
import Card from '../components/ui/Card'
import DataState from '../components/ui/DataState'
import { useTheme } from '../context/ThemeContext'
import { useWork } from '../hooks/useWork'

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-surface-800">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-surface-300/30 last:border-0">
      <div>
        <p className="text-sm font-medium text-surface-800">{label}</p>
        {hint && <p className="text-xs text-surface-500 mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-accent-indigo' : 'bg-surface-300'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function NumberInput({ value, onChange, onSave, min, step, width = 'w-24' }) {
  const [local, setLocal] = useState('')
  const display = local !== '' ? local : value

  return (
    <input
      type="number"
      min={min}
      step={step}
      value={display}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== '') { onSave(local); setLocal('') } }}
      className={`${width} rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 focus:outline-none focus:ring-1 focus:ring-accent-indigo`}
    />
  )
}

function TextInput({ value, onChange, onSave, maxLength, width = 'w-20', className = '' }) {
  const [local, setLocal] = useState('')
  const display = local !== '' ? local : value

  return (
    <input
      type="text"
      maxLength={maxLength}
      value={display}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== '') { onSave(local); setLocal('') } }}
      className={`${width} rounded-lg border border-surface-300 bg-surface-50 px-3 py-1.5 text-sm text-surface-800 uppercase focus:outline-none focus:ring-1 focus:ring-accent-indigo ${className}`}
    />
  )
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { settings, loading, error, updateSettings } = useWork()

  async function saveWork(patch) {
    await updateSettings({ ...settings, ...patch })
  }

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">Settings</h1>
        <p className="text-surface-500 text-sm mt-0.5">Preferences & account</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Card>
          <Row
            label="Theme"
            hint={theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-surface-500">{theme === 'dark' ? 'Dark' : 'Light'}</span>
              <Toggle checked={theme === 'light'} onChange={toggleTheme} />
            </div>
          </Row>
        </Card>
      </Section>

      {/* Work */}
      <Section title="Work">
        <DataState loading={loading} error={error}>
          <Card subtitle="Pay & shift settings">
            <Row label="Hourly rate" hint="Used to calculate earnings">
              <NumberInput
                value={settings.hourly_rate}
                min={0}
                step={0.01}
                width="w-24"
                onSave={v => saveWork({ hourly_rate: parseFloat(v) })}
              />
            </Row>
            <Row label="Currency" hint="3-letter code e.g. EUR, USD">
              <TextInput
                value={settings.currency}
                maxLength={3}
                width="w-20"
                onSave={v => saveWork({ currency: v.trim().toUpperCase() })}
              />
            </Row>
            <Row label="Unpaid break" hint="Deducted from each shift automatically">
              <div className="flex items-center gap-2">
                <NumberInput
                  value={settings.break_minutes}
                  min={0}
                  step={5}
                  width="w-20"
                  onSave={v => saveWork({ break_minutes: parseInt(v, 10) })}
                />
                <span className="text-sm text-surface-500">min</span>
              </div>
            </Row>
          </Card>
        </DataState>
      </Section>
    </div>
  )
}
