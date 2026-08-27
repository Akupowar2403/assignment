import { useNavigate } from 'react-router-dom'
import { UserCell } from '../components/Avatar'
import { StatusBadge } from '../components/TaskBadges'
import { Card, Readout, ReadoutCell } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useCurrentUser } from '../context/CurrentUserContext'
import { useApi } from '../hooks/useApi'
import { TONE_COLOR, priorityColor } from '../lib/constants'
import { formatDate } from '../lib/format'
import { dashboardService } from '../services/dashboard'
import { taskService } from '../services/tasks'

const CELLS = [
  { key: 'total', label: 'Total', query: {} },
  { key: 'pending', label: 'Pending', accent: TONE_COLOR.neutral, query: { status: 'pending' } },
  { key: 'in_progress', label: 'In progress', accent: TONE_COLOR.blue, query: { status: 'in_progress' } },
  { key: 'completed', label: 'Completed', accent: TONE_COLOR.green, query: { status: 'completed' } },
  { key: 'blocked', label: 'Blocked', accent: TONE_COLOR.red, query: { status: 'blocked' } },
  { key: 'overdue', label: 'Overdue', accent: TONE_COLOR.amber, query: { overdue: 'true' } },
]

const COLUMNS = [
  {
    key: 'title',
    header: 'Task',
    render: (task) => <span className="font-medium text-ink">{task.title}</span>,
  },
  { key: 'assignee', header: 'Assignee', render: (task) => <UserCell user={task.assignee} /> },
  { key: 'status', header: 'Status', render: (task) => <StatusBadge value={task.status} /> },
  {
    key: 'due_date',
    header: 'Due',
    className: 'font-mono tnum text-[13px]',
    render: (task) => (
      <span className={task.is_overdue ? 'font-medium text-sig-red' : 'text-muted'}>
        {formatDate(task.due_date)}
      </span>
    ),
  },
]

function TaskPreview({ title, action, data, loading, error, reload }) {
  return (
    <Card title={title} action={action} bodyClassName="">
      {error ? (
        <div className="p-4">
          <ErrorState error={error} onRetry={reload} />
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={data?.items ?? []}
          loading={loading}
          minWidth={460}
          rowAccent={(task) => priorityColor(task.priority)}
          empty={<EmptyState title="Nothing here" description="No tasks to show yet." />}
        />
      )}
    </Card>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { currentUserId, currentUser } = useCurrentUser()

  const stats = useApi(() => dashboardService.stats(currentUserId), [currentUserId])
  const mine = useApi(
    () =>
      currentUserId
        ? taskService.list({ assignee: currentUserId, limit: 5, sort_by: 'due_date', order: 'asc' })
        : Promise.resolve({ items: [] }),
    [currentUserId],
  )
  const attention = useApi(
    () => taskService.list({ overdue: true, limit: 5, sort_by: 'due_date', order: 'asc' }),
    [],
  )

  const goToTasks = (query) => navigate(`/tasks?${new URLSearchParams(query)}`)

  const viewAll = (query) => (
    <button
      onClick={() => goToTasks(query)}
      className="text-[13px] font-medium text-ink underline underline-offset-2 hover:text-muted"
    >
      View all
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] leading-tight font-semibold tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted">
          Where the team stands right now. Select any figure to open that view.
        </p>
      </div>

      {stats.error && <ErrorState error={stats.error} onRetry={stats.reload} />}

      <Readout>
        {CELLS.map((cell) => (
          <ReadoutCell
            key={cell.key}
            label={cell.label}
            accent={cell.accent}
            value={stats.loading ? '—' : (stats.data?.[cell.key] ?? 0)}
            onClick={() => goToTasks(cell.query)}
          />
        ))}
        <ReadoutCell
          label="Mine"
          accent="var(--color-ink)"
          value={stats.loading ? '—' : (stats.data?.assigned_to_me ?? 0)}
          hint={currentUser?.name}
          onClick={() => goToTasks({ assignee: currentUserId })}
        />
      </Readout>

      <div className="grid gap-5 xl:grid-cols-2">
        <TaskPreview
          title="My next tasks"
          action={viewAll({ assignee: currentUserId })}
          {...mine}
        />
        <TaskPreview
          title="Overdue"
          action={viewAll({ overdue: 'true' })}
          {...attention}
        />
      </div>
    </div>
  )
}
