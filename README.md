# store-ratings-app

A complete full-stack implementation of the "FullStack Intern Coding Challenge - V1.1" with PostgreSQL, Prisma, Express (ESM TypeScript), React + Vite + Tailwind + React Query + Axios, JWT auth, role-based access, and zod validation.

## Prerequisites

- Node.js >= 18
- npm
- PostgreSQL running; database `store_ratings` created beforehand (instructions below)

## Quick Start

### Backend setup
```powershell
# from repo root
cd backend
npm install

# copy and edit env if needed
copy .env.example .env
# If DB created, generate prisma & migrate
npx prisma generate
npx prisma migrate dev --name init
# seed (idempotent)
npm run prisma:seed
# start backend (ESM via ts-node --esm)
npm run dev
```

### Frontend setup
```powershell
# in a new terminal
cd ../frontend
npm install
# start frontend
npm run dev
```

## Database Setup

- Default DATABASE_URL in `backend/.env.example` points to `postgresql://postgres:password@localhost:5432/store_ratings`; edit if a different password is used.
- To create DB in psql:
```powershell
psql -U postgres -h localhost -c "CREATE DATABASE store_ratings;"
```

## Sanity Checks

- **API**: `curl http://localhost:4000/` → `{"ok":true,"service":"store-ratings-api"}`
- **Login**: POST `http://localhost:4000/api/auth/login` with seeded creds returns `{ token, user }`:
  - `admin@example.com` / `Admin@123`
  - `owner@example.com` / `Owner@123`
  - `user@example.com` / `User@123`
- **Frontend**: open `http://localhost:5173`, login via AuthPanel, browse stores and rate them

## Windows-Friendly Notes

- If "Must use import to load ES Module": ensure `backend/package.json` has `"type": "module"` and use ts-node ESM loader (`npm run dev`)
- If "File ... seed.ts not under rootDir": `seed.ts` resides in `backend/src`; `tsconfig` `rootDir="."` includes `src` and `prisma`
- If "Property 'env' does not exist on type 'ImportMeta'": ensure `frontend/src/vite-env.d.ts` exists and is included
- If "Property 'user' does not exist on type 'Request'": ensure `backend/src/types.d.ts` exists and restart TS Server in VSCode
- If Vite alias errors: `vite.config.ts` defines alias `@` -> `src`
- If prisma generate fails: confirm `backend/.env` `DATABASE_URL` and that Postgres is running

## Features Implemented

### Authentication & Authorization
- JWT-based auth with signup/login
- Role-based access control (ADMIN, USER, OWNER)
- Password validation (8-16 chars, uppercase + special char)
- Name validation (20-60 chars)
- Address validation (≤400 chars)

### User Roles
- **Normal User**: View stores, search, submit/update ratings (1-5 stars)
- **Store Owner**: View ratings for their stores, update password
- **Admin**: Create users/stores, dashboard with stats, user/store management

### Database Schema (Prisma)
- User model with role enum
- Store model with optional owner relation
- Rating model with unique constraint on (userId, storeId)

### API Endpoints
- Health check: `GET /`
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/password`
- Stores: `GET /api/stores`, `GET /api/stores/:id`
- Ratings: `POST /api/ratings`
- Owner: `GET /api/owner/ratings`
- Admin: `GET /api/admin/stats`, `GET /api/admin/users`, `POST /api/admin/stores`, etc.

### Frontend Features
- Responsive design with Tailwind CSS
- Framer Motion animations (respects `prefers-reduced-motion`)
- React Query for data fetching
- Glass morphism UI design
- Interactive star rating widget
- Search and filtering
- Role-based dashboard views

## Tech Stack

### Backend
- Node.js with TypeScript (ESM)
- Express.js
- Prisma ORM
- PostgreSQL
- JWT authentication
- Zod validation
- bcryptjs for password hashing

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS
- React Query (TanStack Query)
- Framer Motion
- Axios for HTTP requests

## Troubleshooting

- **Ports in use**: change `PORT` in `backend/.env` or `VITE_API_URL` in `frontend/.env`
- **JWT errors**: check `JWT_SECRET` in `backend/.env`
- **CORS**: backend enables `cors()` by default; adjust origin if needed

## Project Structure

```
store-ratings-app/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── prisma.ts
│       ├── types.d.ts
│       ├── seed.ts
│       ├── server.ts
│       └── middleware/
│           ├── auth.ts
│           └── validation.ts
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── vite-env.d.ts
│       ├── main.tsx
│       ├── index.css
│       ├── lib/
│       │   └── api.ts
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── pages/
│       │   └── App.tsx
│       └── components/
│           ├── Layout.tsx
│           ├── Hero.tsx
│           ├── StoreList.tsx
│           ├── AuthPanel.tsx
│           ├── Dashboard.tsx
│           └── RateWidget.tsx
└── README.md
```

## License

MIT

---

Single auth with signup/login/JWT; role-based pages and APIs, store listing/detail/search, rating create/update with unique constraint, owner dashboards and averages, admin user/store management and stats, sorting/filtering, and validation constraints are implemented to spec.
