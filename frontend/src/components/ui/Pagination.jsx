import { Button } from './Button'

export function Pagination({ page, pages, total, limit, onPageChange }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-2.5">
      <p className="tnum font-mono text-[11px] tracking-[0.06em] text-muted uppercase">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="tnum px-1 font-mono text-[11px] text-muted">
          {page} / {Math.max(pages, 1)}
        </span>
        <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
