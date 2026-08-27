import { Spinner } from './States'

/**
 * Generic table. `columns` is `[{ key, header, sortable, className, render(row) }]`.
 * Sorting is reported upward; the caller decides what to do with it (we page on the API).
 */
export function DataTable({ columns, rows, loading, sort, onSortChange, onRowClick, empty }) {
  const toggle = (key) => {
    if (!onSortChange) return
    const order = sort?.sortBy === key && sort.order === 'desc' ? 'asc' : 'desc'
    onSortChange({ sortBy: key, order })
  }

  return (
    <div className="relative overflow-x-auto">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-12">
          <Spinner className="text-brand" />
        </div>
      )}
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-xs font-medium tracking-wide text-muted uppercase ${column.className ?? ''}`}
              >
                {column.sortable ? (
                  <button
                    onClick={() => toggle(column.key)}
                    className="inline-flex items-center gap-1 transition hover:text-ink"
                  >
                    {column.header}
                    <span className={sort?.sortBy === column.key ? 'text-brand' : 'text-line'}>
                      {sort?.sortBy === column.key && sort.order === 'asc' ? '▲' : '▼'}
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
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-line/70 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-brand-soft/40' : ''}`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 align-middle ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && empty}
    </div>
  )
}
