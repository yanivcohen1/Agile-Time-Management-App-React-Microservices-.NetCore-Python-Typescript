# Time Management App

A comprehensive full-stack application designed for time management and task tracking. This project demonstrates a modern microservices architecture with a React frontend and multiple backend services.

## 🏗 Architecture

The solution consists of three main components:

1.  **Frontend**: A Single Page Application (SPA) built with React.
2.  **Auth Service (.NET)**: A robust authentication and user management service.
3.  **Backend Service (Python)**: A lightweight service for additional functionality (e.g., alternative auth/data processing).

## 🚀 Technologies

### Frontend (`/frontend`)
*   **Framework**: React 18 + TypeScript + Vite
*   **UI Libraries**: Material UI (MUI) v5 + PrimeReact v10
*   **Routing**: React Router v6 (Nested Routes)
*   **State Management**: Context API
*   **Testing**: Vitest + React Testing Library
*   **E2E Testing**: Playwright
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
├── frontend/                 # React Application
├── backend_netCore_service/  # ASP.NET Core Web API
├── backend_python_service/   # FastAPI Service
└── README.md                 # This file
```

## 🛠 Getting Started

Each service has its own detailed setup instructions. Please refer to the respective README files:

*   [Frontend Setup](./frontend/README.md)
*   [.NET Backend Setup](./backend_netCore_service/README.md)
*   [Python Backend Setup](./backend_python_service/readme.md)

## ✨ Recent Updates

*   **UI Overhaul**: Integrated PrimeReact components into the Material UI shell.
*   **Theming**: Implemented a synchronized Dark/Light mode across all UI components.
*   **Navigation**: Enhanced sidebar navigation with active state logic and breadcrumbs.
*   **Routing**: Improved deep-linking capabilities for "About Me" and other nested pages.

## Main Board
<img width="2273" height="1587" alt="image" src="https://github.com/user-attachments/assets/7c5ce500-2ea9-4da5-a5f8-02f64c1a195f" />

## Track Status
<img width="1958" height="1527" alt="image" src="https://github.com/user-attachments/assets/7767e30b-7f4e-4bf9-9658-7a7f7480abd0" />

## Agile Board
<img width="2598" height="1494" alt="image" src="https://github.com/user-attachments/assets/8d395445-01e9-4946-bad5-afb05dae0561" />

## Ligth mode
<img width="2276" height="1709" alt="image" src="https://github.com/user-attachments/assets/bcf05515-a81a-46f4-9ffa-a53091aec02a" />

## Mobile mode
<img width="1034" height="1888" alt="image" src="https://github.com/user-attachments/assets/7ed3a206-3d2f-491a-bc39-8593fdd4eb3e" />
