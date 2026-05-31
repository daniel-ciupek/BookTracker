# BookTracker

Full-stack application for tracking read books, optimized for 10 million records.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Styles | Tailwind CSS v3 |
| List virtualization | @tanstack/react-virtual |
| Backend | Laravel 13 (PHP 8.3) |
| ORM | Eloquent |
| Database | PostgreSQL 16 (Docker) |
| Cache | Redis 7 (Docker) |
| Backend tests | Pest PHP v4 |
| Frontend tests | Vitest + @testing-library/react |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- Docker + Docker Compose
- PHP 8.3 + Composer
- Node.js 20+

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve          # http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # http://localhost:5173
```

## API

| Method | Endpoint | Response |
|---|---|---|
| `POST` | `/api/books` | `201 Book` / `422 errors` / `429 rate limit` |
| `GET` | `/api/books?cursor=&limit=50&search=` | `{ data: Book[], next_cursor: number\|null }` |
| `GET` | `/api/health` | `{ status, db, cache }` |

## Running Tests

```bash
# Backend (Pest)
cd backend && php artisan test

# Frontend (Vitest)
cd frontend && npm test

# Backend lint
cd backend && ./vendor/bin/pint --test
cd backend && ./vendor/bin/phpstan analyse

# Frontend lint
cd frontend && npm run lint
```

## Scaling Strategy (10M records)

| Problem | Solution |
|---|---|
| Efficient pagination | Cursor-based keyset pagination on `id` |
| Fast search | GIN trigram indexes (`pg_trgm`) on `title` and `author` |
| Repeated queries | Redis cache (TTL 60s), invalidated on POST |
| Long list rendering | `@tanstack/react-virtual` — only visible rows rendered |

## Seeding with large datasets

```bash
cd backend
SEED_COUNT=100000 php artisan db:seed --class=BookSeeder
```

## AI Usage

This project was built with assistance from Claude (Anthropic) as a coding assistant. Claude helped with:
- Scaffolding and configuration of the full-stack setup
- Implementation of business logic (ISBN validation, cursor pagination, GIN indexes)
- Writing tests (Pest feature/unit tests, Vitest component tests)
- CI/CD pipeline configuration

All generated code was reviewed, tested, and verified against the requirements.

## Known Limitations (intentional)

- **No authentication** — single-user app; auth (Sanctum + users table) is out of scope
- **No production deployment** — intentionally omitted; production setup would use Docker + nginx + supervisor or Forge/Vapor
- **No production monitoring** — locally Monolog → stderr; production would use Sentry + Telescope + Prometheus/Grafana
