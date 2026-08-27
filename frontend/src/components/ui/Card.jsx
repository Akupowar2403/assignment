export function Card({ title, action, children, className = '', bodyClassName = 'p-5' }) {
  return (
    <section className={`rounded-2xl border border-line bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, tone = 'slate', hint, active, onClick }) {
  const tones = {
    slate: 'text-slate-700',
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    brand: 'text-brand',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? 'border-brand ring-2 ring-brand/20' : 'border-line'
      }`}
    >
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </button>
  )
}
