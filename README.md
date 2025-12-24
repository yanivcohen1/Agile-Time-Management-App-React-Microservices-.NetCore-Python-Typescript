# Time Management App

A comprehensive full-stack application designed for time management and task tracking. This project demonstrates a modern microservices architecture with a React frontend and multiple backend services.

## 🏗 Architecture

The solution consists of three main components:

1.  **Frontend**: A Single Page Application (SPA) built with React.
2.  **Auth Service (.NET)**: A robust authentication and user management service.
3.  **Backend Service (Python)**: A lightweight service for additional functionality (e.g., alternative auth/data processing).

### Architecture & Patterns

#### Frontend (`client/`)
- **State Management:** React Context (`src/context/`) is used for global state like Auth and Theme.
- **API Layer:** `src/api/axios.ts` configures the Axios instance with interceptors for:
  - Attaching JWT tokens (`Authorization: Bearer ...`).
  - Global loading progress bar.
  - Global error handling (snackbars).
- **UI Components:** Uses Material UI (`@mui/material`). Custom theme defined in `src/theme.ts`.
- **Routing:** `react-router-dom` defined in `src/App.tsx`.

#### Backend - Python (`backend_python_service/`)
- **Framework:** FastAPI with async routes.
- **Database:** MongoDB accessed via **Beanie** ODM (`app/models.py`).
  - Models are defined as Pydantic models inheriting from `beanie.Document`.
  - Database initialization happens in `app/database.py` called from `app/main.py` startup event.
- **Configuration:** Settings loaded from `config.dev.yaml` / `config.prod.yaml` via `app/config.py`.

#### Backend - .NET Core (`backend_netCore_service/`)
- **Framework:** ASP.NET Core 9.0 Web API.
- **Database:** MongoDB via Entity Framework Core.
- **Authentication:** JWT-based authentication with role-protected endpoints.
- **Configuration:** YAML-based settings (`dev.appsettings.yaml`, `prod.appsettings.yaml`).
- **Testing:** xUnit + WebApplicationFactory (Integration Tests).

## 🚀 Technologies

### Frontend (`/client`)
*   **Framework**: React 18 + TypeScript + Vite
*   **UI Libraries**: Material UI (MUI) v5 + PrimeReact v10
*   **Routing**: React Router v6 (Nested Routes)
*   **State Management**: Context API
*   **Testing**: Vitest + React Testing Library
*   **E2E Testing**: Cypress
*   **Key Features**:
    *   Dark/Light Theme switching (synced between MUI and PrimeReact)
    *   Responsive Sidebar Drawer (Desktop/Mobile layouts)
    *   Role-based Access Control (RBAC)
    *   Breadcrumb navigation
*   Configuration: YAML-based settings

### Backend - .NET Core (`/backend_netCore_service`)
*   **Framework**: ASP.NET Core 9.0 Web API
*   **Database**: MongoDB (via Entity Framework Core)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Testing**: xUnit + WebApplicationFactory (Integration Tests)
*   **Configuration**: YAML-based settings
*   **Swagger**: API Documentation with Swagger

### Backend - Python (`/backend_python_service`)
*   **Framework**: FastAPI
*   **Database**: MongoDB (via Motor(Async MongoDB), Beanie ODM)
*   **Authentication**: JWT
*   **Configuration**: YAML-based settings
*   **Testing**: Pytest + TestClient
*   **Swagger**: API Documentation with Swagger

## 📂 Project Structure

```
root/
├── client/                   # React Application
├── backend_netCore_service/  # ASP.NET Core Web API
├── backend_python_service/   # FastAPI Service
└── README.md                 # This file
```

## 🛠 Getting Started

Each service has its own detailed setup instructions. Please refer to the respective README files:

*   [Frontend Setup](./client/README.md)
*   [.NET Backend Setup](./backend_netCore_service/README.md)
*   [Python Backend Setup](./backend_python_service/README.md)

## 📦 Available Scripts

All commands are run from the `client/` directory using `pnpm`.

### Frontend
| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `vite` | Start the frontend development server |
| `build` | `tsc -b && vite build` | Build the frontend for production |
| `preview` | `vite preview` | Preview the production build |
| `lint` | `eslint .` | Lint the frontend code |
| `test` | `vitest run` | Run frontend unit tests |
| `test:watch` | `vitest` | Run frontend unit tests in watch mode |
| `coverage` | `vitest run --coverage` | Run frontend tests with coverage report |
| `test:e2e` | `cypress run ...` | Run E2E tests with Cypress |
| `test:e2e:report` | `cypress run ...` | Run E2E tests and generate report |

### Backend - Python
| Script | Command | Description |
| :--- | :--- | :--- |
| `serve:py` | `uvicorn app.main:app ...` | Start Python backend (Dev) |
| `serve:py:prod` | `uvicorn app.main:app ...` | Start Python backend (Prod) |
| `seed:py` | `python seed.py` | Seed the Python backend database |
| `test:py` | `pytest` | Run Python backend tests |
| `lint:py` | `pylint app tests` | Lint Python backend code |

### Backend - .NET
| Script | Command | Description |
| :--- | :--- | :--- |
| `serve:cs` | `dotnet run` | Start .NET backend (Dev) |
| `serve:cs:prod` | `dotnet run -- --env prod` | Start .NET backend (Prod) |
| `seed:cs` | `dotnet run -- --seed` | Seed the .NET backend database |
| `test:cs` | `dotnet test` | Run .NET backend tests |
| `lint:cs` | `dotnet format` | Format .NET backend code |

## 🐛 Debugging

This project includes VS Code debug configurations for all three components. Ensure you have the necessary VS Code extensions installed: Debugger for Chrome, Python, and C#.

### Prerequisites
- VS Code extensions: 
  - Debugger for Chrome (for React debugging)
  - Python (for Python backend debugging)
  - C# (for .NET backend debugging)

### Debug Configurations

1. **Debug React App**:
   - Starts the React development server on `http://localhost:5173`.
   - Opens Chrome and attaches the debugger.
   - Set breakpoints in `client/src/` files.

2. **Debug Python Backend**:
   - Launches the FastAPI server with auto-reload.
   - Set breakpoints in `backend_python_service/app/` files.

3. **Debug .NET Backend**:
   - Builds and launches the ASP.NET Core API.
   - Automatically opens the browser when the server is ready.
   - Set breakpoints in `backend_netCore_service/AuthApi/` files.

### How to Debug
1. Open the project in VS Code.
2. Go to the Run and Debug view (Ctrl+Shift+D).
3. Select the desired configuration from the dropdown.
4. Click the green play button or press F5 to start debugging.
5. For React: Ensure the dev server is running (you can start it manually with `pnpm dev` in the client folder if needed).
6. Set breakpoints in your code and interact with the application.

## ✨ Recent Updates

*   **UI Overhaul**: Integrated PrimeReact components into the Material UI shell.
*   **Theming**: Implemented a synchronized Dark/Light mode across all UI components.
*   **Navigation**: Enhanced sidebar navigation with active state logic and breadcrumbs.
*   **Routing**: Improved deep-linking capabilities for "About Me" and other nested pages.

## Main Board
<img width="2357" height="1641" alt="image" src="https://github.com/user-attachments/assets/c3b693db-2a38-4000-b42d-9d33a7cb59d2" />

## Track Status
<img width="2640" height="1772" alt="image" src="https://github.com/user-attachments/assets/e5df594a-e7ca-4680-8154-581ab42db6b1" />

## Agile Board
<img width="2359" height="1590" alt="image" src="https://github.com/user-attachments/assets/5adff857-bb68-4a87-977c-8374196da52d" />

## Ligth mode
<img width="2350" height="1634" alt="image" src="https://github.com/user-attachments/assets/8787e147-3769-4a91-8844-568c52bce2f4" />

## Mobile mode
<img width="1008" height="1650" alt="image" src="https://github.com/user-attachments/assets/3f6e5a13-82f0-4cba-ac78-8efffe51f357" />
