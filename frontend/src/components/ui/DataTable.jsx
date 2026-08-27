import { Spinner } from './States'

const HEAD = 'px-3 py-2 text-left font-mono text-[11px] tracking-[0.08em] text-muted uppercase'

/**
 * Generic table. `columns` is `[{ key, header, sortable, className, render(row) }]`.
 * `rowAccent(row)` returns a colour for the leading rail — the spine that makes
 * priority scannable down the whole list. Sorting is reported upward.
 */
export function DataTable({
  columns,
  rows,
  loading,
  sort,
  onSortChange,
  onRowClick,
  rowAccent,
  minWidth = 880,
  empty,
}) {
  const toggle = (key) => {
    if (!onSortChange) return
    const order = sort?.sortBy === key && sort.order === 'desc' ? 'asc' : 'desc'
    onSortChange({ sortBy: key, order })
  }

  return (
    <div className="relative overflow-x-auto">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-surface/70 pt-10">
          <Spinner />
        </div>
      )}
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-rule bg-ground/60">
            {columns.map((column) => (
              <th key={column.key} className={`${HEAD} ${column.className ?? ''}`}>
                {column.sortable ? (
                  <button
                    onClick={() => toggle(column.key)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                  >
                    {column.header}
                    <span
                      aria-hidden
                      className={sort?.sortBy === column.key ? 'text-ink' : 'text-rule'}
                    >
                      {sort?.sortBy === column.key && sort.order === 'asc' ? '↑' : '↓'}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const accent = rowAccent?.(row)
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-rule-soft last:border-0 ${
                  onRowClick ? 'cursor-pointer transition-colors hover:bg-ground' : ''
                }`}
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2.5 align-middle text-sm ${column.className ?? ''}`}
                    // Inset shadow rather than a border: it survives border-collapse.
                    style={
                      index === 0 && accent
                        ? { boxShadow: `inset 3px 0 0 ${accent}` }
                        : undefined
                    }
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {!loading && rows.length === 0 && empty}
    </div>
  )
}
