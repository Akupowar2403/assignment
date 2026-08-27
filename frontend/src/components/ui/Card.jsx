export function Card({ title, action, children, className = '', bodyClassName = 'p-4' }) {
  return (
    <section className={`rounded-lg border border-rule bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-rule px-4 py-2.5">
          <h2 className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase">{title}</h2>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

/**
 * A readout panel: cells share one frame and are divided by rules, the way a
 * status board reads, rather than floating as separate cards.
 */
export function Readout({ children }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-surface sm:grid-cols-4 lg:grid-cols-7 lg:divide-y-0">
      {children}
    </div>
  )
}

export function ReadoutCell({ label, value, accent, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative px-4 py-4 text-left transition-colors hover:bg-ground"
    >
      {accent && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: accent }}
        />
      )}
      <span className="block font-mono text-[11px] tracking-[0.08em] text-muted uppercase">
        {label}
      </span>
      <span className="tnum mt-2 block font-display text-[32px] leading-none font-semibold text-ink">
        {value}
      </span>
      {hint && <span className="mt-1.5 block truncate text-xs text-muted">{hint}</span>}
    </button>
  )
}
