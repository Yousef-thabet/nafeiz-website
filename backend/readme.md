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

## Image storage

Admin image uploads use the protected `POST /api/assets/upload` endpoint with a multipart `file` field and an `entity` field. The legacy `POST /api/assets/upload-url` and article-assets route remain aliases for compatibility. The backend validates the actual image with Sharp and stores it atomically under `UPLOAD_DIR`; public files are served at `/uploads`. Set `UPLOAD_DIR=/home/admin/nafeiz-website/uploads` in production (local development can use `./uploads`) and set `PUBLIC_SITE_URL` to the public site origin.

The production Nginx server must map the public path to the same directory without exposing any other filesystem paths:

```nginx
location /uploads/ {
   alias /home/admin/nafeiz-website/uploads/;
   try_files $uri =404;
   autoindex off;
   expires 1d;
   add_header Cache-Control "public, max-age=86400";
}
```

Ensure the PM2 process user can traverse `/home/admin/nafeiz-website` and write to the uploads directory, while uploaded files remain non-executable (`0644`) and directories remain non-writable to the public (`0755`). Verify the deployed Nginx configuration with `sudo nginx -t` and verify a known uploaded file with `curl -I https://nafeiz.com/uploads/<storage-key>`.

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
