# Finance Dashboard — Full Stack

A complete finance dashboard with a **React** frontend and **Node.js + Express + SQLite** backend.

---

## Project Structure

```
finance-dashboard/
├── backend/                   ← Express API
│   ├── src/
│   │   ├── config/database.js
│   │   ├── middleware/auth.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── frontend/                  ← React app
    ├── public/index.html
    ├── src/
    │   ├── api/client.js
    │   ├── components/
    │   │   ├── auth/          Login, Register
    │   │   ├── dashboard/     Dashboard with charts
    │   │   ├── records/       CRUD table with filters
    │   │   ├── users/         User management cards
    │   │   ├── layout/        Sidebar layout
    │   │   └── ui.js          Shared UI components
    │   ├── context/AuthContext.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## Quick Start

### Step 1 — Backend

```bash
cd backend
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
npm start
```

Backend runs at: **http://localhost:5000**

On first start it seeds a default admin:
- Email: `admin@finance.dev`
- Password: `admin123`

### Step 2 — Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in frontend's package.json forwards all `/api/*` requests to the backend automatically.

---

## Roles & Access

| Feature | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / register | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| Filter records | ✅ | ✅ | ✅ |
| Dashboard & charts | ❌ | ✅ | ✅ |
| Create / edit / delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Features

### Backend
- JWT authentication (24h expiry)
- Role-based access control middleware
- Financial records CRUD with soft delete
- Dashboard analytics (summary, monthly trends, category breakdown, recent activity)
- Pagination and filtering on all list endpoints
- Input validation with descriptive error messages
- Rate limiting (200 req / 15 min per IP)
- SQLite database — no installation required, no C++ build tools needed

### Frontend
- Dark-themed dashboard UI
- Area chart for monthly income vs expenses
- Pie chart for expense categories
- Summary stat cards
- Records table with type/category/date filters and pagination
- User management with role/status editing
- Role-based sidebar navigation
- Protected routes with redirect logic

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/records              ?type= &category= &startDate= &endDate= &page= &limit=
GET    /api/records/:id
POST   /api/records              (admin)
PATCH  /api/records/:id          (admin)
DELETE /api/records/:id          (admin, soft delete)

GET    /api/dashboard/summary    (analyst+)
GET    /api/dashboard/categories (analyst+)
GET    /api/dashboard/monthly    (analyst+)
GET    /api/dashboard/weekly     (analyst+)
GET    /api/dashboard/recent     (analyst+)

GET    /api/users                (admin)
GET    /api/users/:id            (admin)
PATCH  /api/users/:id            (admin)
DELETE /api/users/:id            (admin)

GET    /api/health
```

---

## Environment Variables (backend/.env)

```
PORT=5000
JWT_SECRET=change-this-to-something-long-and-random
DB_PATH=./data/finance.db
```

---

## Troubleshooting

**`npm install` fails on backend** — Make sure you are in the `backend/` folder. This project uses `sqlite3` which installs via pre-built binaries (no Visual Studio needed).

**Frontend shows network error** — Make sure the backend is running on port 5000 before starting the frontend.

**Port already in use** — Change `PORT` in `backend/.env` and update `"proxy"` in `frontend/package.json` to match.
