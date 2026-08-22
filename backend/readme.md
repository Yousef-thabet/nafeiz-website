# NAFEIZ Trade Co., Ltd. Backend

## Overview
This backend powers the public website contact form, admin dashboard, website settings, testimonials, and employee management for NAFEIZ Trade Co., Ltd.

## Stack
- Node.js + Express
- PostgreSQL + Prisma
- JWT + refresh tokens + bcrypt
- HubSpot CRM integration

## Setup
1. Copy `.env.example` to `.env` and update the values.
2. Create a PostgreSQL database and set `DATABASE_URL`.
3. Install dependencies:
   - `npm install`
4. Run Prisma migrations:
   - `npm run migrate`
5. Start the server:
   - `npm run dev`

Provision the production admin account through a secure administrative process. This project does not run a seed script in production.

## Backup and recovery

Back up PostgreSQL with a versioned, encrypted dump before migrations and on a scheduled basis:

```bash
pg_dump --format=custom --file=nafeiz-$(date +%Y%m%d).dump "$DATABASE_URL"
```

Restore into a prepared database with:

```bash
pg_restore --clean --if-exists --dbname="$DATABASE_URL" nafeiz-YYYYMMDD.dump
```

Protect database dumps and JWT secrets as production credentials. Verify a restore in a separate database before relying on it for recovery.

## Production deployment

1. Configure production environment variables and strong JWT secrets.
2. Run `npm ci`, `npm run prisma:generate`, and `npm run migrate`.
3. Start with `npm start` and monitor `/health`.
4. Configure HTTPS, a reverse proxy, database backups, and the frontend `VITE_API_URL`.

## API routes
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/messages`
- `GET /api/messages/:id`
- `POST /api/messages/:id/note`
- `PUT /api/messages/:id/status`
- `PUT /api/messages/:id/assign`
- `GET /api/testimonials`
- `POST /api/testimonials`
- `PUT /api/testimonials/:id`
- `DELETE /api/testimonials/:id`
