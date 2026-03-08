export default function Placeholder({ title, subtitle = 'Section coming soon.' }) {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-surface-800">{title}</h1>
      <p className="text-surface-500 text-sm mt-0.5">{subtitle}</p>
      <div className="mt-8 rounded-xl bg-surface-50 border border-surface-200/80 p-12 text-center text-surface-500">
        Placeholder — no backend logic. UI only.
      </div>
    </div>
  )
}
