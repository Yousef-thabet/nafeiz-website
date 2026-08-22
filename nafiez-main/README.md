# NAFEIZ Trade

## Frontend Setup

```bash
npm install
npm run dev
```

Development requests use the Vite proxy and expect the backend at `http://localhost:5000`.

For production, set `VITE_API_URL` to the public backend API URL before building:

```env
VITE_API_URL=https://api.example.com/api
```

Then build and deploy the generated `dist` directory:

```bash
npm run lint
npm run build
```

## Backend Requirements

Configure the backend `.env` with a production PostgreSQL URL, strong JWT secrets, `NODE_ENV=production`, and the deployed frontend URL in `FRONTEND_URL` or `CORS_ORIGINS`. Run Prisma migrations before starting the server.

The public Settings API is used by the frontend for contact details, section content, localized `L10n` values, statistics, social links, and footer content.

