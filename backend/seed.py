"""Populate the database with a demo team and a spread of tasks."""
from datetime import timedelta

from app.database import SessionLocal, engine
from app.models import Base, Comment, Task, TaskPriority, TaskStatus, User, utcnow

USERS = [
    ("Akanksha Powar", "akanksha@webvory.com", "admin"),
    ("Ravi Menon", "ravi@webvory.com", "manager"),
    ("Sara Iyer", "sara@webvory.com", "member"),
    ("Dev Kapoor", "dev@webvory.com", "member"),
]

# (title, description, status, priority, assignee index, due in days)
TASKS = [
    ("Migrate Shopify storefront to new theme", "Port the custom sections and re-test checkout.", TaskStatus.in_progress, TaskPriority.high, 0, 4),
    ("Fix Shopify webhook retries", "Orders webhook drops on 500; add idempotency key.", TaskStatus.blocked, TaskPriority.urgent, 1, -2),
    ("Write onboarding docs for interns", None, TaskStatus.pending, TaskPriority.low, 2, 21),
    ("Quarterly invoice reconciliation", "Match Stripe payouts against the ledger.", TaskStatus.completed, TaskPriority.medium, 3, -10),
    ("Set up staging environment", "Mirror prod on a smaller instance.", TaskStatus.in_progress, TaskPriority.medium, 1, 9),
    ("Redesign the dashboard landing page", "Cards on top, task table below.", TaskStatus.pending, TaskPriority.high, 0, 2),
    ("Audit third-party npm dependencies", None, TaskStatus.pending, TaskPriority.medium, 2, -5),
    ("Client call: requirements for CRM module", "Prepare a scope doc before the call.", TaskStatus.completed, TaskPriority.high, 1, -14),
    ("Add rate limiting to public API", "60 req/min per key.", TaskStatus.pending, TaskPriority.urgent, 3, 1),
    ("Clean up unused S3 buckets", None, TaskStatus.blocked, TaskPriority.low, 3, -1),
    ("Improve task search performance", "Index title and description.", TaskStatus.in_progress, TaskPriority.medium, 0, 12),
    ("Rotate database credentials", "Coordinate with the deploy window.", TaskStatus.pending, TaskPriority.high, 1, 6),
    ("Draft Q3 team retrospective", None, TaskStatus.completed, TaskPriority.low, 2, -20),
    ("Fix mobile layout on task list", "Table overflows below 400px.", TaskStatus.pending, TaskPriority.medium, 2, 3),
    ("Set up automated backups", "Nightly dump to object storage.", TaskStatus.in_progress, TaskPriority.urgent, 3, -3),
    ("Refactor email notification service", "Batch digests instead of per-event mail.", TaskStatus.pending, TaskPriority.low, 0, 30),
    ("Investigate slow Shopify product sync", "Takes 40 min for 5k products.", TaskStatus.in_progress, TaskPriority.high, 1, 7),
    ("Add unit tests for the tasks router", None, TaskStatus.pending, TaskPriority.medium, 2, 15),
    ("Update the company handbook", "New leave policy section.", TaskStatus.pending, TaskPriority.low, 3, 45),
    ("Decommission the legacy reporting job", "Nothing reads its output any more.", TaskStatus.completed, TaskPriority.medium, 0, -30),
    ("Design the notification bell UI", None, TaskStatus.pending, TaskPriority.medium, 2, 11),
    ("Load-test the dashboard endpoint", "Target 500 concurrent users.", TaskStatus.blocked, TaskPriority.high, 1, 5),
    ("Configure CI for the frontend build", "Run lint and build on every PR.", TaskStatus.in_progress, TaskPriority.medium, 0, 8),
    ("Archive completed 2025 projects", None, TaskStatus.completed, TaskPriority.low, 3, -60),
]

COMMENTS = [
    (1, 1, "Theme ports cleanly, checkout still needs a pass."),
    (1, 2, "I can take the checkout testing on Thursday."),
    (2, 1, "Waiting on Shopify support to confirm the retry policy."),
    (9, 3, "Which key do we bucket on - API key or IP?"),
    (15, 0, "Backups ran but the restore path is untested."),
]


def main() -> None:
    Base.metadata.create_all(engine)
    db = SessionLocal()
    if db.query(User).count():
        print("Database already seeded - nothing to do.")
        return

    users = [User(name=n, email=e, role=r) for n, e, r in USERS]
    db.add_all(users)
    db.flush()

    now = utcnow()
    tasks = [
        Task(
            title=title,
            description=description,
            status=status,
            priority=priority,
            assigned_to=users[assignee].id,
            due_date=now + timedelta(days=days),
        )
        for title, description, status, priority, assignee, days in TASKS
    ]
    db.add_all(tasks)
    db.flush()

    db.add_all(
        Comment(task_id=tasks[t].id, user_id=users[u].id, comment=text)
        for t, u, text in COMMENTS
    )
    db.commit()
    print(f"Seeded {len(users)} users, {len(tasks)} tasks, {len(COMMENTS)} comments.")


if __name__ == "__main__":
    main()
