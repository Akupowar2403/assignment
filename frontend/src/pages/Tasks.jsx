import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { UserCell } from '../components/Avatar'
import { TaskDetail } from '../components/TaskDetail'
import { TaskFilters } from '../components/TaskFilters'
import { TaskForm } from '../components/TaskForm'
import { PriorityBadge, StatusBadge } from '../components/TaskBadges'
import { Button } from '../components/ui/Button'
import { DataTable } from '../components/ui/DataTable'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useApi } from '../hooks/useApi'
import { useDebounced } from '../hooks/useDebounced'
import { PAGE_SIZE } from '../lib/constants'
import { formatDate, formatDateTime } from '../lib/format'
import { taskService } from '../services/tasks'

const DEFAULTS = {
  search: '',
  status: '',
  priority: '',
  assignee: '',
  overdue: '',
  sort_by: 'created_at',
  order: 'desc',
  page: '1',
}

/** Filter state lives in the URL, so a filtered view can be shared or reloaded. */
function useTaskQuery() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(
    () => Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, params.get(k) ?? DEFAULTS[k]])),
    [params],
  )

  // Any filter change resets to page 1 unless the change *is* the page.
  const update = useCallback(
    (changes) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === '' || value === DEFAULTS[key]) next.delete(key)
          else next.set(key, value)
        }
        if (!('page' in changes)) next.delete('page')
        return next
      })
    },
    [setParams],
  )

  return { filters, update, reset: () => setParams(new URLSearchParams()) }
}

export function TasksPage() {
  const { filters, update, reset } = useTaskQuery()
  const [editing, setEditing] = useState(null) // null | 'new' | task
  const [openTaskId, setOpenTaskId] = useState(null)

  // The search box keeps its own state so typing stays responsive; the URL
  // (and therefore the request) only catches up once typing pauses.
  const [searchText, setSearchText] = useState(filters.search)
  const debouncedSearch = useDebounced(searchText)

  useEffect(() => {
    if (debouncedSearch !== filters.search) update({ search: debouncedSearch })
  }, [debouncedSearch, filters.search, update])

  const clearFilters = () => {
    setSearchText('')
    reset()
  }

  const query = {
    search: debouncedSearch,
    status: filters.status,
    priority: filters.priority,
    assignee: filters.assignee,
    overdue: filters.overdue,
    sort_by: filters.sort_by,
    order: filters.order,
    page: filters.page,
    limit: PAGE_SIZE,
  }

  const { data, loading, error, reload } = useApi(
    () => taskService.list(query),
    Object.values(query),
  )

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Task',
        sortable: true,
        render: (task) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{task.title}</p>
            {task.description && (
              <p className="mt-0.5 max-w-md truncate text-xs text-muted">{task.description}</p>
            )}
          </div>
        ),
      },
      { key: 'assignee', header: 'Assignee', render: (task) => <UserCell user={task.assignee} /> },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        render: (task) => <PriorityBadge value={task.priority} />,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (task) => <StatusBadge value={task.status} />,
      },
      {
        key: 'due_date',
        header: 'Due',
        sortable: true,
        render: (task) => (
          <span className={task.is_overdue ? 'font-medium text-red-600' : 'text-muted'}>
            {formatDate(task.due_date)}
          </span>
        ),
      },
      {
        key: 'created_at',
        header: 'Created',
        sortable: true,
        render: (task) => <span className="text-muted">{formatDate(task.created_at)}</span>,
      },
      {
        key: 'updated_at',
        header: 'Updated',
        sortable: true,
        render: (task) => <span className="text-muted">{formatDateTime(task.updated_at)}</span>,
      },
    ],
    [],
  )

  const afterSave = () => {
    setEditing(null)
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Tasks</h1>
          <p className="mt-1 text-sm text-muted">
            {data ? `${data.total} task${data.total === 1 ? '' : 's'} match this view` : 'Loading…'}
          </p>
        </div>
        <Button onClick={() => setEditing('new')}>New task</Button>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <TaskFilters
          filters={{ ...filters, search: searchText }}
          onChange={({ search, ...rest }) => {
            if (search !== undefined) setSearchText(search)
            if (Object.keys(rest).length) update(rest)
          }}
          onReset={clearFilters}
        />
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <DataTable
            columns={columns}
            rows={data?.items ?? []}
            loading={loading}
            sort={{ sortBy: filters.sort_by, order: filters.order }}
            onSortChange={({ sortBy, order }) => update({ sort_by: sortBy, order })}
            onRowClick={(task) => setOpenTaskId(task.id)}
            empty={
              <EmptyState
                title="No tasks match these filters"
                description="Try widening the search, or clear the filters to see everything."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
          {data && data.total > 0 && (
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              limit={data.limit}
              onPageChange={(page) => update({ page: String(page) })}
            />
          )}
        </div>
      )}

      {editing && (
        <TaskForm
          open
          task={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={afterSave}
        />
      )}

      {openTaskId && (
        <TaskDetail
          open
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onEdit={(task) => {
            setOpenTaskId(null)
            setEditing(task)
          }}
          onDeleted={() => {
            setOpenTaskId(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
