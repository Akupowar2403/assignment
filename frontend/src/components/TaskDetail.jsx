import { useState } from 'react'
import { useCurrentUser } from '../context/CurrentUserContext'
import { useApi } from '../hooks/useApi'
import { formatDate, formatDateTime } from '../lib/format'
import { taskService } from '../services/tasks'
import { Avatar } from './Avatar'
import { PriorityBadge } from './TaskBadges'
import { StatusControl } from './StatusControl'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { ErrorState, Spinner } from './ui/States'

function Detail({ label, mono, children }) {
  return (
    <div>
      <dt className="font-mono text-[11px] tracking-[0.08em] text-muted uppercase">{label}</dt>
      <dd className={`mt-1 text-ink ${mono ? 'tnum font-mono text-[13px]' : 'text-sm'}`}>
        {children}
      </dd>
    </div>
  )
}

function CommentThread({ taskId }) {
  const { currentUserId, users } = useCurrentUser()
  const { data: comments, loading, error, reload } = useApi(
    () => taskService.listComments(taskId),
    [taskId],
  )
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState(null)

  const post = async (e) => {
    e.preventDefault()
    setPosting(true)
    setPostError(null)
    try {
      await taskService.addComment(taskId, { user_id: currentUserId, comment: draft.trim() })
      setDraft('')
      reload()
    } catch (err) {
      setPostError(err)
    } finally {
      setPosting(false)
    }
  }

  const author = users.find((u) => u.id === currentUserId)

  return (
    <div className="space-y-3">
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <Spinner className="text-muted" />}

      {comments?.length === 0 && !loading && (
        <p className="text-sm text-muted">No notes yet. Add the first one below.</p>
      )}

      <ul className="space-y-3">
        {comments?.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <Avatar user={comment.user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">
                <span className="font-medium text-ink">{comment.user?.name ?? 'Removed user'}</span>
                {' · '}
                <span className="font-mono tnum">{formatDateTime(comment.created_at)}</span>
              </p>
              <p className="mt-0.5 text-sm whitespace-pre-wrap text-ink">{comment.comment}</p>
            </div>
          </li>
        ))}
      </ul>

      {postError && <ErrorState error={postError} />}
      <form onSubmit={post} className="flex items-start gap-2 border-t border-rule pt-3">
        <Avatar user={author} size="sm" />
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Add a note as ${author?.name ?? '…'}`}
          className="flex-1 resize-y rounded-md border border-rule bg-surface px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
        />
        <Button size="sm" type="submit" disabled={posting || !draft.trim()}>
          {posting && <Spinner />}
          Post
        </Button>
      </form>
    </div>
  )
}

export function TaskDetail({ taskId, open, onClose, onEdit, onDeleted, onChanged }) {
  const { data: task, loading, error, reload } = useApi(() => taskService.get(taskId), [taskId])
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Keep both the panel and the list behind it in step after an inline edit.
  const refresh = () => {
    reload()
    onChanged?.()
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await taskService.remove(taskId)
      onDeleted()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={loading ? 'Loading…' : (task?.title ?? 'Task')}
      onClose={onClose}
      width="max-w-2xl"
      footer={
        task && (
          <>
            {confirming ? (
              <>
                <span className="mr-auto text-sm text-muted">Delete this task and its notes?</span>
                <Button variant="secondary" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={remove} disabled={deleting}>
                  {deleting && <Spinner />}
                  Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setConfirming(true)}>
                  Delete
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => onEdit(task)}>Edit task</Button>
              </>
            )}
          </>
        )
      }
    >
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <Spinner className="text-muted" />}

      {task && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusControl task={task} onChanged={refresh} />
            <PriorityBadge value={task.priority} />
            {task.is_overdue && (
              <span className="text-[13px] font-medium text-sig-red">Overdue</span>
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap text-ink">
            {task.description || <span className="text-muted italic">No description.</span>}
          </p>

          <dl className="grid grid-cols-2 gap-4 rounded-md border border-rule bg-ground p-4 sm:grid-cols-4">
            <Detail label="Assignee">
              <span className="flex items-center gap-2">
                <Avatar user={task.assignee} size="sm" />
                {task.assignee?.name ?? 'Unassigned'}
              </span>
            </Detail>
            <Detail label="Due" mono>{formatDate(task.due_date)}</Detail>
            <Detail label="Created" mono>{formatDate(task.created_at)}</Detail>
            <Detail label="Updated" mono>{formatDateTime(task.updated_at)}</Detail>
          </dl>

          <div>
            <h3 className="mb-3 font-mono text-[11px] tracking-[0.08em] text-muted uppercase">Notes</h3>
            <CommentThread taskId={taskId} />
          </div>
        </div>
      )}
    </Modal>
  )
}
