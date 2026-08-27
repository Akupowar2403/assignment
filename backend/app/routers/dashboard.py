from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Task, TaskStatus
from ..schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(user_id: int | None = None, db: Session = Depends(get_db)):
    by_status = dict(db.execute(select(Task.status, func.count()).group_by(Task.status)).all())

    def count_where(*filters) -> int:
        return db.scalar(select(func.count()).select_from(Task).where(*filters))

    return DashboardStats(
        total=sum(by_status.values()),
        pending=by_status.get(TaskStatus.pending, 0),
        in_progress=by_status.get(TaskStatus.in_progress, 0),
        completed=by_status.get(TaskStatus.completed, 0),
        blocked=by_status.get(TaskStatus.blocked, 0),
        overdue=count_where(Task.due_date < func.now(), Task.status != TaskStatus.completed),
        assigned_to_me=count_where(Task.assigned_to == user_id) if user_id else 0,
    )
