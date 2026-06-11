# PlantShop

Full-stack web application with a Next.js frontend and a NestJS API.

## Requirements

- Node.js `24.16.0`
- npm
- configured `frontend/.env` and `backend/.env`
- available MySQL database

Install application dependencies once:

```bash
npm run install:all
```

## Development

From the project root:

```bash
npm run dev
```

This starts:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`

Press `Ctrl+C` once to stop both processes.

## Production build

Build the frontend and backend:

```bash
npm run build
```

Start an existing production build:

```bash
npm start
```

Build and start both applications in production mode:

```bash
npm run prod
```

## Project checks

```bash
npm run lint
npm test
```
