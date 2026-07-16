# NovaTasks - Modern Task Management Application

NovaTasks is a production-quality, responsive full-stack task management application. The app offers user authentication via JSON Web Tokens (JWT) and complete CRUD operations for tasks with real-time searching, category status filtering (All, Pending, Completed), sorting by due dates/creation dates, priority badge categorization (High, Medium, Low), and dark/light theme persistence.

---

## Technical Architecture

### Frontend
- **React 19** & **Vite** (Next-generation React framework and bundling tool)
- **Tailwind CSS** (Utility-first styling with persistent dark/light styling states)
- **React Router v6** (Client-side routing with Public and Protected page guards)
- **TanStack Query v5 (React Query)** (Server-state caching, fetching, and background invalidations)
- **React Hook Form** & **Zod** (State validation and error tracking)
- **Axios** (Promise-based API requests with automated JWT header insertion interceptors)
- **React Hot Toast** & **Lucide React** (Rich aesthetic feedback and system icons)

### Backend
- **FastAPI** (High-performance ASGI framework with Pydantic v2 validation)
- **SQLAlchemy ORM** & **SQLite** (Declarative relational database persistence)
- **JWT (python-jose & passlib[bcrypt])** (Secure token issuance, verification, and password hashing)
- **CORS Middleware** (Configured to support communication between frontend and backend hosts)

---

## Folder Structure

```text
NovaTasks/
  ├── backend/
  │   ├── app/
  │   │   ├── models/            # SQLAlchemy database schemas
  │   │   ├── routers/           # FastAPI versioned endpoints
  │   │   ├── schemas/           # Pydantic request & response validators
  │   │   ├── auth.py            # Password hashing & JWT dependencies
  │   │   ├── config.py          # Configuration and .env loader
  │   │   ├── database.py        # SQLite database connection setup
  │   │   └── main.py            # FastAPI main entry point & CORS
  │   ├── requirements.txt
  │   └── .env
  ├── frontend/
  │   ├── src/
  │   │   ├── api/               # Axios services
  │   │   ├── components/        # Reusable UI widgets
  │   │   ├── context/           # Auth Session context
  │   │   ├── pages/             # Authentication & Dashboard screens
  │   │   ├── utils/             # Validation & error parsing utilities
  │   │   ├── App.jsx            # Routing and provider wrappers
  │   │   ├── index.css          # Tailwind base & custom transitions
  │   │   └── main.jsx
  │   ├── package.json
  │   ├── tailwind.config.js
  │   └── postcss.config.js
  ├── README.md
  └── .gitignore
```

---

## Setup & Running the Application

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### 1. Backend Setup (FastAPI)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     source .venv/bin/activate
     ```
4. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Create a `.env` file in the `backend/` directory:
   ```env
   SECRET_KEY=your-production-secret-key-change-this
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   FRONTEND_URL=http://localhost:5173
   ```
6. Run the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   *The API will run at `http://127.0.0.1:8000`. You can visit `http://127.0.0.1:8000/docs` to view the interactive Swagger UI API documentation.*

### 2. Frontend Setup (React 19 + Vite)
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory (optional - defaults to local port 8000):
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application will run at `http://localhost:5173`.*

---

## API Endpoints Reference

All paths are prefixed by `/api/v1`.

### Diagnostics
- **`GET /health`** - System check for Render/health-monitors.

### Authentication
- **`POST /auth/register`** - Registers a new user. Enforces unique email check and password >= 6 characters.
- **`POST /auth/login`** - Log in and returns a JWT token.
- **`GET /auth/me`** - Retrieves details of the currently logged-in user.

### Tasks (Protected by JWT Bearer auth)
- **`GET /tasks`** - Fetch tasks for the current user. Supports:
  - Filtering: `status` (`pending`/`completed`), `priority` (`low`/`medium`/`high`)
  - Searching: `search` (real-time query matching title or description)
  - Sorting: `sort_by` (`created_at`/`due_date`/`priority`/`title`), `sort_order` (`asc`/`desc`)
- **`POST /tasks`** - Create a new task.
- **`PUT /tasks/{id}`** - Updates details or toggles completion status.
- **`DELETE /tasks/{id}`** - Deletes a task.
