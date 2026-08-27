from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, case, desc, func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Comment, Task, TaskPriority, TaskStatus, User
from ..schemas import (
    CommentCreate,
    CommentOut,
    Page,
    TaskCreate,
    TaskDetail,
    TaskOut,
    TaskUpdate,
)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# Urgent > high > medium > low, so sorting by priority is meaningful instead of alphabetical.
PRIORITY_RANK = case(
    {
        TaskPriority.low: 1,
        TaskPriority.medium: 2,
        TaskPriority.high: 3,
        TaskPriority.urgent: 4,
    },
    value=Task.priority,
)

SORT_FIELDS = {
    "created_at": Task.created_at,
    "updated_at": Task.updated_at,
    "due_date": Task.due_date,
    "title": Task.title,
    "status": Task.status,
    "priority": PRIORITY_RANK,
}


def get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Task {task_id} not found")
    return task


def check_user_exists(user_id: int | None, db: Session, field: str) -> None:
    if user_id is not None and db.get(User, user_id) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{field} {user_id} does not exist")


@router.get("", response_model=Page[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    status_: TaskStatus | None = Query(default=None, alias="status"),
    priority: TaskPriority | None = None,
    assignee: int | None = None,
    search: str | None = None,
    overdue: bool = False,
    sort_by: str = Query(default="created_at", pattern="|".join(SORT_FIELDS)),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    filters = []
    if status_ is not None:
        filters.append(Task.status == status_)
    if priority is not None:
        filters.append(Task.priority == priority)
    if assignee is not None:
        filters.append(Task.assigned_to == assignee)
    if search:
        term = f"%{search}%"
        filters.append(or_(Task.title.ilike(term), Task.description.ilike(term)))
    if overdue:
        filters.append(Task.due_date < func.now())
        filters.append(Task.status != TaskStatus.completed)

    total = db.scalar(select(func.count()).select_from(Task).where(*filters))
    direction = asc if order == "asc" else desc
    rows = db.scalars(
        select(Task)
        .where(*filters)
        .order_by(direction(SORT_FIELDS[sort_by]), Task.id.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).unique()

    return Page(
        items=list(rows),
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/{task_id}", response_model=TaskDetail)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return get_task_or_404(task_id, db)


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    check_user_exists(payload.assigned_to, db, "assigned_to")
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = get_task_or_404(task_id, db)
    changes = payload.model_dump(exclude_unset=True)
    if "assigned_to" in changes:
        check_user_exists(changes["assigned_to"], db, "assigned_to")
    for field, value in changes.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db.delete(get_task_or_404(task_id, db))
    db.commit()


@router.get("/{task_id}/comments", response_model=list[CommentOut])
def list_comments(task_id: int, db: Session = Depends(get_db)):
    return get_task_or_404(task_id, db).comments


@router.post(
    "/{task_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED
)
def create_comment(task_id: int, payload: CommentCreate, db: Session = Depends(get_db)):
    get_task_or_404(task_id, db)
    check_user_exists(payload.user_id, db, "user_id")
    comment = Comment(task_id=task_id, **payload.model_dump())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
