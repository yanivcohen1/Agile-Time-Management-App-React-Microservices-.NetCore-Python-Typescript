# Express + TypeScript + MongoDB + MikroORM + Tsoa + Vitest

A robust Express server written in TypeScript providing comprehensive features for user authentication, role-based access control, and Todo management using MongoDB and MikroORM and Tsoa.

## Features

- **TypeScript-first Setup:** Strict type checking and modern ESM support.
- **Authentication & RBAC:**
  - Secure `/auth/login` with JWT issuance.
  - Role-based Access Control (Admin vs. User).
  - `/auth/me` to retrieve current session details.
  - `/auth/users` for administrative user management.
- **Todo Management:**
  - Full CRUD operations via `/todos`.
  - Advanced filtering (status, search, date range).
  - Pagination and sorting support.
  - Status and workload analytics via aggregation pipelines.
- **API Documentation (Swagger):**
  - Interactive Swagger UI available at `/docs`.
  - Powered by **Tsoa** for automatic OpenAPI spec generation.
- **Security & Reliability:**
  - Helmet for security headers and CORS configuration.
  - Centralized error handling with typed HTTP errors.
  - Health check endpoint at `/health`.
- **Infrastructure:**
  - MikroORM with MongoDB driver for efficient data access.
  - **Tsoa** for TypeScript-first API design and Swagger generation.
  - YAML-based configuration (`appsettings.yml`) with environment file overrides.
  - Database seeding for quick development setup.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB 3.6+ (tested with 3.6.23)

**Note:** This application uses MikroORM 5.x for MongoDB integration. It is configured to use the `MongoDriver` and `TsMorphMetadataProvider`. Ensure that your environment supports TypeScript decorators, as they are used for entity definitions.

### Installation

1. Install dependencies:
   ```powershell
   pnpm install
   ```

2. Ensure MongoDB is running and accessible.

3. Seed the database with initial users:
   ```powershell
   pnpm seed:db
   ```

   By default, this creates two users (configurable via `.env`):
   - Admin: `admin@todo.dev` / `ChangeMe123!`
   - User: `user@todo.dev` / `ChangeMe123!`

### Configuration

The application uses `appsettings.yml` for base configuration and environment-specific `.env` files for overrides.

#### Environments

The application supports multiple environments via the `NODE_ENV` environment variable:
- **Development** (`NODE_ENV=development`): Default. Loads `.env.development`.
- **Production** (`NODE_ENV=production`): Loads `.env.production`.

#### appsettings.yml (Base Settings)

| Key | Description |
|-----|-------------|
| `Jwt.Key` | Secret key for signing JWT tokens. |
| `ConnectionStrings.MongoConnection` | Default MongoDB connection string. |
| `Server.Urls` | Semicolon-separated list of server URLs (used to derive default port). |
| `Cors.AllowedOrigins` | Comma-separated list of allowed CORS origins. |

#### Environment Parameters (.env files)

The following parameters can be set in `.env.development` or `.env.production`:

| Variable | Description |
|----------|-------------|
| `PORT` | Overrides the port derived from `Server.Urls`. |
| `MONGO_URI` | Overrides `ConnectionStrings.MongoConnection`. |
| `MONGO_DB` | Overrides the database name (extracted from URI by default). |
| `JWT_ACCESS_TTL_SECONDS` | Token expiration time in seconds (default: 3600). |
| `AUTH_ADMIN_USERNAME` | Admin username for seeding/authentication. |
| `AUTH_ADMIN_PASSWORD` | Admin password for seeding/authentication. |
| `AUTH_USER_USERNAME` | User username for seeding/authentication. |
| `AUTH_USER_PASSWORD` | User password for seeding/authentication. |

**Important:** Change the `Jwt.Key` in `appsettings.yml` (or provide an environment-specific override if implemented) to a strong secret in production.

### Development

```powershell
pnpm dev
```
By default, this runs in `development` mode using `.env.development`.

## API Documentation

This project uses **Tsoa** to generate an OpenAPI specification and serve it via Swagger UI.

- **Swagger UI:** Accessible at `http://localhost:5000/docs` (when the server is running).
- **Endpoint Definitions:** Located in `src/controllers/`. Any changes to controllers or models will be reflected in the documentation once regenerated.

### Regenerating API Docs

If you add new routes, controllers, or modify request/response types, you must regenerate the Tsoa routes and OpenAPI spec:

```powershell
pnpm tsoa
```

This command runs `tsoa spec-and-routes`, updating the following files:
- `src/public/swagger.json` (OpenAPI Spec)
- `src/routes/routes.ts` (Auto-generated Express routes)

### Production Build

```powershell
pnpm build
pnpm start
```
`pnpm start` runs in `production` mode using `.env.production`.

## Scripts

- `pnpm dev`: Start development server with auto-reload using `ts-node-dev`.
- `pnpm build`: Compile the TypeScript code to JavaScript in the `dist` folder.
- `pnpm start`: Run the compiled production server from the `dist` folder.
- `pnpm seed:db`: Seed the database with default admin and user credentials.
- `pnpm lint`: Run linting checks using ESLint and check types.
- `pnpm test`: Run unit tests once using Vitest.
- `pnpm test:watch`: Run unit tests in watch mode using Vitest.

## Project Structure

```text
express_ts/
├── src/                # Source code directory
│   ├── config/         # Configuration logic (database connection, env vars)
│   ├── controllers/    # API Controllers (Tsoa decorators)
│   ├── errors/         # Custom HTTP error classes
│   ├── middleware/     # Express middleware (auth, tsoa authentication)
│   ├── models/         # MikroORM entities
│   ├── routes/         # Auto-generated routes (by Tsoa)
│   ├── types/          # TypeScript custom type definitions
│   ├── app.ts          # Express application configuration
│   └── server.ts       # Main entry point that starts the server
├── tests/              # Test suites and setup files
├── appsettings.yml     # Central configuration file (YAML)
├── create-users.ts     # Script to seed the database with initial users
├── tsoa.json           # Tsoa configuration file
├── package.json        # Project metadata, dependencies, and scripts
└── tsconfig.json       # Main TypeScript configuration
```

## API

### Auth Endpoints (`/auth`)

#### POST `/auth/login`
Validates credentials and returns a JWT.
- **Body**: `{ "username": "...", "password": "..." }`
- **Response**: `{ "access_token": "...", "token_type": "Bearer", "expires_in": 3600, "role": "admin", "name": "..." }`

#### GET `/auth/me`
Returns current user information (requires auth).
- **Header**: `Authorization: Bearer <token>`

#### GET `/auth/users`
Lists all users (requires admin role).
- **Header**: `Authorization: Bearer <token>`

#### POST `/auth/verify`
Verify a JWT token and retrieve its payload.
- **Body**: `{ "token": "..." }`

### Todo Endpoints (`/todos`)
*All todo endpoints require authentication.*

#### GET `/todos`
Lists todos with support for pagination, sorting, and filtering.
- **Query Params**: `page`, `size`, `sort_by`, `sort_desc`, `status`, `search`, `due_date_start`, `due_date_end`, `user_id` (admin only).

#### POST `/todos`
Creates a new todo.
- **Body**: `{ "title": "...", "description": "...", "status": "BACKLOG", "due_date": "..." }`

#### PUT `/todos/:id`
Updates an existing todo.
- **Body**: Partial todo object.

#### DELETE `/todos/:id`
Deletes a todo.

#### GET `/todos/stats/status`
Retrieves count of todos grouped by status (`BACKLOG`, `PENDING`, `IN_PROGRESS`, `COMPLETED`).

#### GET `/todos/stats/workload`
Retrieves daily todo counts grouped by date.

### System & Profile Endpoints

#### GET `/health`
Simple health check returning `{ "status": "ok" }`.

#### GET `/user/profile`
User-specific profile endpoint (requires 'user' role).

#### GET `/admin/reports`
Admin-specific reporting endpoint (requires 'admin' role).

## Testing the Endpoints

With the server running, use your preferred HTTP client (Postman, curl, etc.) to send requests. Ensure the `Authorization` header uses `Bearer <token>` for protected routes.

The application supports CORS for the configured origins, allowing frontend applications to make requests from those domains.

## Next Steps

- Update `appsettings.yml` with production values (strong JWT key, production MongoDB connection).
- Add refresh tokens and revoke logic.
- Implement request logging and rate limiting.
- Consider adding user registration endpoints if needed.
- Add input validation and sanitization for enhanced security.
