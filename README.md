# Taskdesk — Internal Task & Management Dashboard

A small internal management app for creating, assigning, tracking and discussing a team's
tasks from one dashboard.

**Stack:** React + Vite + Tailwind CSS · Python + FastAPI · PostgreSQL (SQLite works too)

---

## Table of contents

- [Features](#features)
- [Running the project](#running-the-project)
- [Project structure](#project-structure)
- [Database design](#database-design)
- [API reference](#api-reference)
- [Reusable code](#reusable-code)
- [Notes and decisions](#notes-and-decisions)

---

## Features

**Dashboard** — total, pending, in progress, completed, blocked and overdue task counts, plus
the count assigned to the current user. Every card is a shortcut: selecting one opens the task
list already filtered to it. Below the cards are two previews — the current user's next tasks by
due date, and everything overdue.

**Task management** — create, edit and delete tasks; assign to a team member; set priority,
status, due date and description; add notes/comments in a thread on the task.

**Task list** — one row per task with name, assignee, priority, status, due date, created date
and last updated date. Search, status/priority/assignee filters, sortable columns and pagination
are all resolved **on the backend** — the frontend never loads more than one page of records.
The active view is encoded in the URL, so a filtered list can be bookmarked or shared.

**Team** — list of members with their role and join date, and a form to add a new one.

| Statuses | Priorities |
| --- | --- |
| `pending`, `in_progress`, `completed`, `blocked` | `low`, `medium`, `high`, `urgent` |

---

## Running the project

**Prerequisites:** Python 3.11+, Node 18+, and Docker (for PostgreSQL).

### 1. Database

```bash
docker compose up -d db
```

Starts PostgreSQL 16 on `localhost:5432` with database `taskdb` (user `taskuser`, password
`taskpass`), matching `backend/.env.example`.

> **No Docker?** The app runs on SQLite with no server at all — in step 2, set
> `DATABASE_URL=sqlite:///./app.db` in `backend/.env` instead. Nothing else changes.

### 2. Backend

```bash
cd backend

python -m venv .venv
source .venv/Scripts/activate      # Windows (Git Bash)
# source .venv/bin/activate        # macOS / Linux

pip install -r requirements.txt
cp .env.example .env               # holds DATABASE_URL

alembic upgrade head               # create the tables
python seed.py                     # optional: 4 users, 24 tasks, 5 comments

uvicorn app.main:app --reload --port 8000
```

- API → <http://127.0.0.1:8000>
- Interactive docs (Swagger) → <http://127.0.0.1:8000/docs>

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App → <http://localhost:5173>

Vite proxies `/api` to `http://127.0.0.1:8000`, so no CORS setup is needed in development. To
point the build at a different host, set `VITE_API_BASE_URL` (see `frontend/.env.example`).

```bash
npm run build     # production bundle in dist/
npm run lint
```

---

## Project structure

```
assignment/
├── docker-compose.yml              PostgreSQL 16
├── backend/
│   ├── app/
│   │   ├── main.py                 FastAPI app, CORS, router registration
│   │   ├── database.py             engine, session, get_db dependency
│   │   ├── models.py               SQLAlchemy models (User, Task, Comment)
│   │   ├── schemas.py              Pydantic request/response schemas
│   │   └── routers/
│   │       ├── tasks.py            CRUD, filtering, search, sorting, pagination, comments
│   │       ├── users.py            list and create team members
│   │       └── dashboard.py        aggregate counts
│   ├── alembic/                    migrations
│   ├── seed.py                     demo data
│   └── requirements.txt
└── frontend/
    ├── vite.config.js              React + Tailwind plugins, /api proxy
    └── src/
        ├── lib/                    api client, shared constants, formatters
        ├── services/               one module per API resource
        ├── hooks/                  useApi, useDebounced
        ├── context/                CurrentUserContext
        ├── components/ui/          generic primitives (see below)
        ├── components/             task-specific composites
        └── pages/                  Dashboard, Tasks, Team
```

---

## Database design

```
users                      tasks                        comments
─────────                  ─────────                    ─────────
id           PK            id            PK             id          PK
name                       title                        task_id     FK → tasks.id
email        UNIQUE        description                  user_id     FK → users.id
role                       status        enum, indexed  comment
created_at                 priority      enum, indexed  created_at
                           assigned_to   FK → users.id
                           due_date      indexed
                           created_at
                           updated_at
```

**Relationships**

- `users 1 ─── N tasks` via `tasks.assigned_to`. A task may be unassigned, so the column is
  nullable and set to `ON DELETE SET NULL` — removing a person leaves their tasks intact
  rather than destroying team history.
- `tasks 1 ─── N comments` via `comments.task_id`, `ON DELETE CASCADE`. A note has no meaning
  without its task, so deleting a task takes its thread with it.
- `users 1 ─── N comments` via `comments.user_id`, `ON DELETE SET NULL`, so a comment survives
  its author's removal and renders as "Removed user".

`status`, `priority`, `assigned_to`, `due_date` and `title` are indexed because every one of
them backs a filter, a sort or a search in the task list.

Schema changes are managed with Alembic (`backend/alembic/versions/`).

---

## API reference

Base URL `/api`. Full interactive documentation at `/docs`.

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | Paginated list — see parameters below |
| `GET` | `/api/tasks/{id}` | One task, including its comments |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/{id}` | Update a task (partial — only the fields sent change) |
| `DELETE` | `/api/tasks/{id}` | Delete a task and its comments |
| `GET` | `/api/tasks/{id}/comments` | Comments on a task, oldest first |
| `POST` | `/api/tasks/{id}/comments` | Add a comment |

**Query parameters for `GET /api/tasks`**

| Parameter | Values | Example |
| --- | --- | --- |
| `status` | `pending` `in_progress` `completed` `blocked` | `?status=in_progress` |
| `priority` | `low` `medium` `high` `urgent` | `?priority=high` |
| `assignee` | user id | `?assignee=12` |
| `search` | matches title **or** description, case-insensitive | `?search=shopify` |
| `overdue` | `true` — past due and not completed | `?overdue=true` |
| `sort_by` | `created_at` `updated_at` `due_date` `title` `status` `priority` | `?sort_by=due_date` |
| `order` | `asc` `desc` (default `desc`) | `?order=asc` |
| `page` | ≥ 1 (default 1) | `?page=1&limit=20` |
| `limit` | 1–100 (default 20) | |

Parameters combine freely: `/api/tasks?status=in_progress&priority=high&assignee=2&page=1&limit=20`

**Response envelope**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Migrate Shopify storefront to new theme",
      "description": "Port the custom sections and re-test checkout.",
      "status": "in_progress",
      "priority": "high",
      "assigned_to": 1,
      "due_date": "2026-08-31T06:34:47",
      "created_at": "2026-08-27T06:34:47",
      "updated_at": "2026-08-27T06:34:47",
      "assignee": { "id": 1, "name": "Akanksha Powar", "email": "akanksha@webvory.com", "role": "admin" },
      "is_overdue": false
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 20,
  "pages": 2
}
```

The assignee is embedded in the response so the task list never needs a second request per row.
`is_overdue` is computed server-side — past due **and** not completed.

### Users and dashboard

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/users` | All team members, by name |
| `POST` | `/api/users` | Create a member |
| `GET` | `/api/dashboard?user_id={id}` | Aggregate counts; `user_id` fills `assigned_to_me` |

### Status codes

| Code | When |
| --- | --- |
| `200` | Successful read or update |
| `201` | Resource created |
| `204` | Deleted, no body |
| `400` | Valid request that references something missing, e.g. `assigned_to` is not a real user |
| `404` | Task or user does not exist |
| `409` | Email already registered |
| `422` | Request failed validation — bad enum, blank title, `page=0`, `limit=500` |

Validation is declarative through Pydantic schemas, so malformed input is rejected before it
reaches a route.

---

## Reusable code

The app is built so the next internal tool can start from this layer rather than from scratch.

### Frontend

**`components/ui/` — generic primitives, no knowledge of tasks**

| Component | Notes |
| --- | --- |
| `Button` | 4 variants, 2 sizes |
| `Input` `Textarea` `Select` | shared label / hint / error treatment |
| `Modal` | focus-safe, Escape to close, scroll lock |
| `DataTable` | driven by a `columns` array with per-column `render`; optional sorting and row clicks |
| `Pagination` | "showing x–y of n" plus page controls |
| `Card` `StatCard` | section container and metric tile |
| `Badge` | 5 colour tones |
| `Spinner` `EmptyState` `ErrorState` | consistent loading, empty and failure states |

**`lib/api.js`** — one `fetch` wrapper handling base URL, query-string building (dropping empty
values), JSON encoding, `204` responses, and an `ApiError` that flattens FastAPI's validation
body into a readable message. Every request in the app goes through it.

**`services/`** — one small module per resource (`taskService`, `userService`,
`dashboardService`). Components call these, never `fetch` directly, so an endpoint change is a
one-line edit in one file.

**`hooks/useApi.js`** — handles the load / error / data / `reload()` cycle once, instead of
repeating four `useState`s in every page. `useDebounced` keeps the search box from firing a
request per keystroke.

**`context/CurrentUserContext.jsx`** — the app has no authentication, so "current user" is a
header picker persisted to `localStorage`. It is isolated in one file specifically so that
dropping in real auth later touches nothing else.

### Backend

- **Routers per resource** (`tasks`, `users`, `dashboard`) — adding a resource means adding a
  file and one `include_router` line.
- **`Page[T]`** — a generic Pydantic envelope reused by any future paginated endpoint.
- **`get_db`** — a single session dependency shared by every route.
- **`get_task_or_404` / `check_user_exists`** — shared guards, so error handling is written once
  and each route body stays about its own job.
- **`SORT_FIELDS`** — a whitelist mapping sort keys to columns, which both enables sorting and
  prevents arbitrary column injection.

---

## Notes and decisions

**Filtering and pagination are server-side.** The task list sends `page`, `limit`, filters and
sort to the API and renders exactly what comes back. Counts come from a separate `COUNT` query,
so the response stays the same size whether the table holds 24 rows or 24,000.

**Priority sorts by rank, not alphabetically.** A plain `ORDER BY priority` puts `high` before
`urgent` and `low` before `medium`, which is wrong. A SQL `CASE` maps each value to a rank so
`urgent > high > medium > low`.

**Filter state lives in the URL.** `/tasks?status=blocked&priority=urgent` is shareable and
survives a refresh. The search box keeps local state and only writes to the URL once typing
pauses, so it stays responsive.

**Enums are stored as strings** (`native_enum=False`) rather than native database enums, keeping
the same migration working on both PostgreSQL and SQLite and avoiding a migration for every new
status value.

**Timestamps are naive UTC** throughout. The frontend appends `Z` before formatting, so times
display in the viewer's own timezone.

**Partial updates.** `PUT /api/tasks/{id}` uses `exclude_unset`, so sending `{"status":
"completed"}` changes only the status — the status dropdown does not have to send the whole task
back.
