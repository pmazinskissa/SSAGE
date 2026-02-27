# Practitioners Playbook

A **white-label training and learning platform** that replaces static training delivery (PDFs, PowerPoint) with an interactive web-based experience. Deploy branded, self-paced courses for any client engagement.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 |
| Content | MDX (Markdown + React components) |
| Deployment | Docker Compose (app + Postgres) |
| Icons | Lucide React |
| Charts | Recharts |
| Diagrams | Mermaid |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for full-stack deployment)

### Local Development

```bash
# 1. Start the database
docker compose up -d db

# 2. One-time setup (copies .env, installs deps, runs migrations)
npm run setup

# 3. Start both servers (in separate terminals)
npm run dev:backend
npm run dev:frontend
```

Open `http://localhost:5173` — the frontend proxies `/api` requests to the backend on port `3001`.

#### Authentication

By default (`.env.example` ships with `OAUTH_PROVIDER=none` and `DEV_AUTH_BYPASS=true`), the login page shows both a one-click **Dev Login** button and a local **email/password** form. You can use either:

- **Dev Login** — instant access as `dev@localhost` with `dev_admin` role
- **Register** — create a local account with any email/password

To use only local auth, set `DEV_AUTH_BYPASS=false` in `.env`. To use OAuth instead, configure the `OAUTH_*` variables (see `.env.example` for details).

#### Troubleshooting

The login page shows amber warning banners when something is wrong:

| Banner | Meaning | Fix |
|--------|---------|-----|
| **Backend not reachable** | API server isn't running | `npm run dev:backend` |
| **Database not connected** | Postgres isn't running or is unreachable | `docker compose up -d db` |

### Docker

```bash
# Build and start all services
docker compose up --build

# Access the app
open http://localhost:3000
```

## Project Structure

```
PractitionersPlaybook/
├── packages/
│   ├── frontend/          # Vite + React SPA
│   ├── backend/           # Express API server
│   └── shared/            # Shared TypeScript types
├── content/
│   ├── courses/           # Course content (YAML + MDX)
│   └── themes/            # Brand themes (YAML + assets)
├── db/migrations/         # PostgreSQL migrations
├── docker-compose.yml
├── Dockerfile
└── docs/                  # Project documentation
```

## Documentation

- [Platform Specification](docs/platform-spec.md) — Full product requirements and architecture
- [Style Guide](docs/STYLE_GUIDE.md) — Protective Life brand guidelines
