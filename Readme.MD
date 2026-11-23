# JanSambandha

**Citizen needs. Government plans. Transparent progress.**

JanSambandha is a web app for local governments. It connects citizens and municipality staff in one place to plan, approve, monitor, and review local development projects.

---

## What it does

- Citizens submit project proposals, give feedback, rate projects, and file complaints.
- Ward chairs review demands and prepare proposals.
- Departments inspect projects and verify contractor progress reports.
- Contractors submit progress updates on their assigned projects.
- General admins manage projects, reviews, and citizen comments.
- The CAO (Chief Administrative Officer) gives final approvals and can view audit logs.

Everyone sees the same information, so the process stays open and accountable.

---

## Built with

| Part | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Zustand |
| Backend | Node.js, Express 5, MongoDB (Mongoose) |
| Validation | Zod |
| Auth | JWT + bcrypt |
| Security | Helmet, CORS, rate limiting |

---

## What you need

- **Node.js** (v18 or newer) and npm
- **MongoDB** running on your machine (or a MongoDB connection URL)

Check them with:

```bash
node -v
npm -v
```

---

## Run it locally

The project has two parts: `backend` and `frontend`. Run them in two separate terminals.

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API will run at **http://localhost:5000**.

Check that it works by opening **http://localhost:5000/api/health**. You should see `{"status":"ok"}`.

### 2. (Optional) Add demo data

```bash
npm run seed
```

This fills the database with sample users and projects.

**Demo login:** use any email below with password `Password@123`

| Role | Email |
| --- | --- |
| Citizen | `citizen@example.com` |
| CAO | `cao@example.com` |
| General Admin | `generaladmin@example.com` |
| Ward Chair | `wardchair@example.com` |
| Department | `department@example.com` |
| Contractor | `contractor@example.com` |

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser and log in.

---

## Settings (environment variables)

### Backend — `backend/.env`

Copy the example file and fill in your values:

```bash
copy .env.example .env
```

| Variable | What it is | Default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `MONGODB_URI` | MongoDB connection URL | `mongodb://127.0.0.1:27017` |
| `DATABASE_NAME` | Database name | — |
| `JWT_SECRET` | Secret used to sign login tokens (use a long random string) | — |
| `CORS_ORIGINS` | Allowed frontend URLs, separated by commas | `http://localhost:3000` |

### Frontend — `frontend/.env.local` (optional)

| Variable | What it is | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API address | `http://localhost:5000/api/v1` |

---

## Project structure

```
jansambandha/
├── backend/          API, database models, routes, and authentication
│   └── src/
│       ├── server.js     app entry point
│       ├── seed.js       demo data generator
│       ├── routes/       API endpoints
│       ├── controllers/  request handling
│       ├── models/       database schemas
│       └── middlewares/  auth, validation, security
└── frontend/         the website users see
    └── app/
        ├── citizen/         citizen pages
        ├── ward-chair/      ward chair pages
        ├── department/      department pages
        ├── contractor/      contractor pages
        ├── general-admin/   admin pages
        ├── cao/             CAO pages
        └── components/      shared UI pieces
```

---

## Useful commands

**Backend** (from `backend/`):

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with auto-reload |
| `npm start` | Start normally |
| `npm run seed` | Load demo data |

**Frontend** (from `frontend/`):

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the website |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run lint` | Check code style |

---

## API at a glance

All endpoints start with `http://localhost:5000/api/v1`.

Most endpoints need a login token. Send it in the request header:

```
Authorization: Bearer <your_token>
```

Main groups:

- `/auth` — register, login, account
- `/users` — manage official users
- `/project-proposals` — submit and approve proposals
- `/projects` — projects, feedback, ratings, comments, progress
- `/complaints` — citizen complaints
- `/notifications` — alerts
- `/suggestions` — citizen suggestions

API responses look like this:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "success": true
}
```

---

## Notes

- There are no automated tests yet (`npm test` is a placeholder).
- One user role is stored as `ward` in the API and shown as "Ward Chair" in the website.
- Keep `JWT_SECRET` private — never share or commit a real secret.
