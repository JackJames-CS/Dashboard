export default function Card({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`rounded-xl bg-white border border-surface-200/80 shadow-card overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-surface-800">{title}</h3>}
            {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
