# Lokesh M · Portfolio

Personal portfolio with an admin dashboard for managing projects.

- **client/**: React 19, Vite, Tailwind CSS 4, Framer Motion
- **server/**: Node.js, Express, MongoDB (Mongoose), JWT auth, Zod validation

## What's in it

**Portfolio**: interactive API-console hero, featured case studies (animated architecture flow, live order tracker), a filterable project grid, skills, a timeline and contact details. Light/dark theme, fully responsive, respects reduced motion.

**Admin dashboard** at `/admin` (only you can log in):
- Add, edit and delete projects, with **Undo** after a delete
- Set the **GitHub source link** and **live demo link** for each project
- Show or hide a project without deleting it
- Star a project to make it a featured case study
- Reorder projects with the up/down arrows
- Edit highlights, metrics, tech stack, category and dates

The public site reads projects from the API. If the API is asleep or unreachable, it shows the last loaded projects (or the built-in list in `client/src/data.js`), so the site never breaks.

## Run locally

You need Node.js 20+ and a MongoDB database (a free MongoDB Atlas cluster works).

### 1. API

```bash
cd server
npm install
cp .env.example .env
npm run hash-password        # type your admin password, copy the printed line into .env
```

Fill in `MONGODB_URI` and `JWT_SECRET` in `.env`, then:

```bash
npm run seed                 # loads your current projects into MongoDB (only if empty)
npm run dev                  # API on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env         # VITE_API_URL=http://localhost:5000
npm run dev                  # http://localhost:5173, admin at http://localhost:5173/admin
```

Without `VITE_API_URL`, the frontend runs in **demo mode**: the admin works against your browser's storage (password `demo1234`), nothing is saved to a server, and the footer shows an "Admin (demo)" link.

## Deploy

1. **MongoDB Atlas**: create a free cluster and a database user, allow access from anywhere (`0.0.0.0/0`), copy the connection string.
2. **API on Render**: New > Blueprint > this repo (uses `render.yaml`). Enter `MONGODB_URI`, `ADMIN_PASSWORD_HASH` and, for now, `CLIENT_ORIGIN=http://localhost:5173`. After it deploys, open the Render Shell and run `npm run seed` once.
3. **Frontend on Netlify**: New site from Git > this repo. Set **Base directory** to `client` (build settings come from `client/netlify.toml`). Add the environment variable `VITE_API_URL` = your Render URL (e.g. `https://lokesh-portfolio-api.onrender.com`) and deploy.
4. **Connect them**: set `CLIENT_ORIGIN` on Render to your Netlify URL (comma-separate if you add a custom domain) and redeploy the API.
5. Go to `https://<your-site>/admin` and log in.

Render's free tier sleeps after inactivity; the first request can take 30 to 60 seconds. Visitors still see your projects instantly from the cached/built-in list.

## API

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | | Health check |
| POST | `/api/auth/login` | | Admin login, returns a JWT |
| GET | `/api/auth/me` | admin | Check the current token |
| GET | `/api/projects` | | Visible projects (featured first) |
| GET | `/api/admin/projects` | admin | All projects, including hidden |
| POST | `/api/admin/projects` | admin | Create a project |
| PATCH | `/api/admin/projects/:id` | admin | Update only the fields sent |
| DELETE | `/api/admin/projects/:id` | admin | Delete a project |
| PUT | `/api/admin/projects/order` | admin | Save a new order (`{ ids: [...] }`) |

## Security

- One admin account, set by environment variables. The password is stored only as a bcrypt hash.
- JWTs (HS256) expire after 2 hours and are kept in `sessionStorage`, so closing the tab logs you out.
- Login is rate-limited to 5 failed attempts per 15 minutes; all API routes have a general rate limit.
- Every write is validated with Zod (strict schemas, `https://` links only, length limits); unknown fields are rejected.
- Helmet security headers, CORS limited to `CLIENT_ORIGIN`, 50 KB body limit, Mongoose `sanitizeFilter`.

## Tests

```bash
cd server
npm test     # Jest + Supertest, uses mongodb-memory-server (or set MONGODB_URI_TEST)
```

12 tests cover login, token checks, every admin route rejecting unauthenticated requests, create/read/update/delete, partial updates, hidden projects, validation, duplicate names and reordering.
