import { useNavigate } from 'react-router-dom'
import { UserCell } from '../components/Avatar'
import { PriorityBadge, StatusBadge } from '../components/TaskBadges'
import { Card, StatCard } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { EmptyState, ErrorState } from '../components/ui/States'
import { useCurrentUser } from '../context/CurrentUserContext'
import { useApi } from '../hooks/useApi'
import { formatDate } from '../lib/format'
import { dashboardService } from '../services/dashboard'
import { taskService } from '../services/tasks'

const CARDS = [
  { key: 'total', label: 'Total tasks', tone: 'slate', query: {} },
  { key: 'pending', label: 'Pending', tone: 'slate', query: { status: 'pending' } },
  { key: 'in_progress', label: 'In progress', tone: 'blue', query: { status: 'in_progress' } },
  { key: 'completed', label: 'Completed', tone: 'green', query: { status: 'completed' } },
  { key: 'blocked', label: 'Blocked', tone: 'red', query: { status: 'blocked' } },
  { key: 'overdue', label: 'Overdue', tone: 'amber', query: { overdue: 'true' } },
]

const COLUMNS = [
  {
    key: 'title',
    header: 'Task',
    render: (task) => <span className="font-medium text-ink">{task.title}</span>,
  },
  { key: 'assignee', header: 'Assignee', render: (task) => <UserCell user={task.assignee} /> },
  { key: 'priority', header: 'Priority', render: (task) => <PriorityBadge value={task.priority} /> },
  { key: 'status', header: 'Status', render: (task) => <StatusBadge value={task.status} /> },
  {
    key: 'due_date',
    header: 'Due',
    render: (task) => (
      <span className={task.is_overdue ? 'font-medium text-red-600' : 'text-muted'}>
        {formatDate(task.due_date)}
      </span>
    ),
  },
]

function TaskPreview({ title, action, ...listProps }) {
  const { data, loading, error, reload } = listProps

  return (
    <Card title={title} action={action} bodyClassName="">
      {error ? (
        <div className="p-5">
          <ErrorState error={error} onRetry={reload} />
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={data?.items ?? []}
          loading={loading}
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Where the team's work stands right now. Select a card to open that view.
        </p>
      </div>

      {stats.error && <ErrorState error={stats.error} onRetry={stats.reload} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            tone={card.tone}
            value={stats.loading ? '—' : (stats.data?.[card.key] ?? 0)}
            onClick={() => goToTasks(card.query)}
          />
        ))}
        <StatCard
          label="Assigned to me"
          tone="brand"
          value={stats.loading ? '—' : (stats.data?.assigned_to_me ?? 0)}
          hint={currentUser?.name}
          onClick={() => goToTasks({ assignee: currentUserId })}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TaskPreview
          title="My next tasks"
          action={
            <button
              onClick={() => goToTasks({ assignee: currentUserId })}
              className="text-xs font-medium text-brand hover:underline"
            >
              View all
            </button>
          }
          {...mine}
        />
        <TaskPreview
          title="Needs attention · overdue"
          action={
            <button
              onClick={() => goToTasks({ overdue: 'true' })}
              className="text-xs font-medium text-brand hover:underline"
            >
              View all
            </button>
          }
          {...attention}
        />
      </div>
    </div>
  )
}
