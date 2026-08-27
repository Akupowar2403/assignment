export function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-rule bg-surface px-3 py-2.5 text-sm">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-sig-red" />
      <span className="text-ink">{error?.message ?? 'Something went wrong.'}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium text-ink underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  )
}
