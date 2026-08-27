from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field

from .models import TaskPriority, TaskStatus, utcnow

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    role: str = Field(default="member", max_length=60)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime


class CommentCreate(BaseModel):
    user_id: int
    comment: str = Field(min_length=1)


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    comment: str
    created_at: datetime
    user: UserOut | None = None


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: TaskStatus = TaskStatus.pending
    priority: TaskPriority = TaskPriority.medium
    assigned_to: int | None = None
    due_date: datetime | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    assigned_to: int | None = None
    due_date: datetime | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    assigned_to: int | None
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime
    assignee: UserOut | None = None

    @computed_field
    @property
    def is_overdue(self) -> bool:
        return bool(
            self.due_date
            and self.status != TaskStatus.completed
            and self.due_date < utcnow()
        )


class TaskDetail(TaskOut):
    comments: list[CommentOut] = []


class DashboardStats(BaseModel):
    total: int
    pending: int
    in_progress: int
    completed: int
    blocked: int
    overdue: int
    assigned_to_me: int
