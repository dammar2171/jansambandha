# Jansambandha

**Citizen Needs. Government Plans. Verified Progress. Real Impact.**

**Local Government Annual Planning, Project Evaluation & Citizen Engagement System**

Jansambandha means "connection with the people." It is a web app for local governments that connects what citizens actually need to what the municipality plans, builds, and reports. Citizens, ward offices, departments, contractors, and the CAO work in one system, so every project can be traced from a real need to a real result.

---

## The Problem We Are Solving

1. There is a gap between what citizens need and the development projects local governments plan.
2. Projects are not planned based on actual need and priority.
3. Budgets and resources can be allocated through favoritism instead of fairness.
4. Running projects are not properly monitored or recorded.
5. There is little transparency in how budgets and resources are distributed.

The result: public money is spent, but people often cannot see whether it solved their problem.

---

## Our Goal

1. Involve citizens in planning, monitoring, and evaluating projects.
2. Enforce evidence-based fairness in resource and budget planning.
3. Prevent inflated progress reports and *Asare Bikash* (haphazard, favor-driven development).
4. Make every responsible entity accountable for its work.
5. Close the loop with outcome evaluation — did the project really solve the problem?

---

## How It Works

1. A citizen posts a need or demand in their ward.
2. Needs are grouped and ranked by priority, urgency, and fairness.
3. The ward and administration turn selected needs into project proposals.
4. Proposals move through review and approval, with every decision recorded.
5. Contractors submit progress updates while work is running.
6. Departments inspect the site and verify those reports.
7. Citizens see live progress, give feedback, and rate the result.
8. Completed projects are evaluated against the original need — closing the loop.

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

## Existing Systems and Their Limits

| System | What it does | Gap |
| --- | --- | --- |
| **Pratipakshya** | Federal cabinet action plan for the government's tenure | No direct involvement of citizens |
| **Lalitpur Metropolitan City App** | Municipal services, emergency dispatch with city police, employee attendance, and notices | Focused on services, not need-based planning or project impact |
| **LGPAS** | Local Government Progress Assessment System | Looks back at previous fiscal year projects at fixed evaluation terms, not live citizen-driven planning |
| **SuTra** | An existing government system | Does not cover the full citizen-need-to-verified-impact loop |

Jansambandha fills this gap by linking planning, execution, verification, and public feedback in one place.

---

## Why a Municipality Needs It

- **Better decisions:** Prioritize projects using public demand, urgency, and feasibility instead of guesswork.
- **Measurable outcomes and early risk detection:** Compare official inspections with contractor reports to catch quality or timeline problems early.
- **Real results for public funds:** Check whether government spending actually produces visible results.
- **Impact check:** See whether completed projects solved the problem and met the citizens' demand.
- **AI support:** Cluster similar reports and complaints, score fairness (equity) of allocation, and support field-level physical verification — capabilities other software lacks.
- **Open ward scoreboards:** Live boards for monitoring and tracking project progress in every ward.

---

## Who Uses It

- **Primary:** Citizens of the local body — they raise needs, give feedback, and evaluate results.
- **Secondary (officials):**
  - Ward chair — reviews local demands and prepares proposals
  - Responsible departments — inspect projects and verify progress
  - General admin — manages projects, reviews, and public comments
  - CAO (Chief Administrative Officer) — final approvals and audit oversight
- **Tertiary:** Contractors — submit progress updates for assigned work.

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

## Scaling Plan

1. **Pilot test** with real citizen needs, budgets, and project milestones.
2. **Feedback and improvement** — customize features based on what the pilot teaches us.
3. **Deliver results** — turn the pilot into an annual contract with the local body.

---

## Conclusion

Make every public project more transparent through evidence-led annual planning and accountability. Jansambandha connects community needs to **verified progress** and **lasting impact** — so citizens can see that their voice turned into real development.

---

## Notes

- There are no automated tests yet (`npm test` is a placeholder).
- One user role is stored as `ward` in the API and shown as "Ward Chair" in the website.
- Keep `JWT_SECRET` private — never share or commit a real secret.
