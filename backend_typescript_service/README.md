# Express + TypeScript + MongoDB + MikroORM + Authorization API

A minimal Express server written in TypeScript with dedicated routes for handling user authorization flows and JWT issuance, using MongoDB for user storage via MikroORM.

## Features

- TypeScript-first Express setup with strict type checking.
- MongoDB integration for user authentication.
- `/api/auth/login` route validating credentials against MongoDB and returning a signed JWT with embedded role information.
- `/api/auth/verify` route validating a provided JWT token.
- Role-protected routes at `/api/user/profile` (user role) and `/api/admin/reports` (admin role).
- Helmet, CORS, and JSON body parsing configured out of the box.
- Centralized error handling with typed HTTP errors.
- Health check endpoint at `/api/health`.
- YAML-based configuration.

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
   - Admin: `admin@example.com` / `Admin123!`
   - User: `user@example.com` / `User123!`

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
│   ├── errors/         # Custom HTTP error classes
│   ├── middleware/     # Express middleware (auth, error handling)
│   ├── models/         # MikroORM entities
│   ├── routes/         # API route definitions
│   ├── types/          # TypeScript custom type definitions
│   ├── app.ts          # Express application configuration
│   └── server.ts       # Main entry point that starts the server
├── tests/              # Test suites and setup files
├── appsettings.yml     # Central configuration file (YAML)
├── create-users.ts     # Script to seed the database with initial users
├── package.json        # Project metadata, dependencies, and scripts
└── tsconfig.json       # Main TypeScript configuration
```

## API

### POST `/api/auth/login`

Request body:

```json
{
  "username": "admin@example.com",
  "password": "Admin123!"
}
```

Response:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "role": "admin"
}
```

### POST `/api/auth/verify`

Request body:

```json
{
  "token": "<jwt>"
}
```

Response:

```json
{
  "valid": true,
  "payload": {
    "sub": "admin@example.com",
    "role": "admin",
    "iat": 0,
    "exp": 0
  }
}
```

### GET `/api/user/profile`

Headers:

- `Authorization: Bearer <jwt>` (token issued to a user role)

Response:

```json
{
  "message": "User profile data",
  "user": {
    "username": "user@example.com",
    "role": "user"
  }
}
```

### GET `/api/admin/reports`

Headers:

- `Authorization: Bearer <jwt>` (token issued to an admin role)

Response:

```json
{
  "message": "Admin dashboard data",
  "user": {
    "username": "admin@example.com",
    "role": "admin"
  }
}
```

## Testing the Endpoints

With the server running, use your preferred HTTP client (Postman, curl, etc.) to send requests. Ensure the `Authorization` header uses `Bearer <token>` for protected routes.

The application supports CORS for the configured origins, allowing frontend applications to make requests from those domains.

## Next Steps

- Update `appsettings.yml` with production values (strong JWT key, production MongoDB connection).
- Add refresh tokens and revoke logic.
- Implement request logging and rate limiting.
- Consider adding user registration endpoints if needed.
- Add input validation and sanitization for enhanced security.
