# React Frontend Client

This is the frontend application for the Time Management App, built with React, TypeScript, and Vite.

## 🚀 Technologies

*   **Framework**: React 18 + TypeScript + Vite
*   **UI Libraries**: Material UI (MUI) v5 + PrimeReact v10
*   **State Management**: React Context API
*   **Routing**: React Router v6
*   **Testing**: Vitest (Unit), Cypress (E2E)
*   **HTTP Client**: Axios

## 🛠 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   pnpm (recommended) or npm/yarn

### Installation

`ash
cd client
pnpm install
`

## 🏃‍♂️ Running the App

### Development Server
Starts the development server at http://localhost:5173.

`ash
pnpm dev
`

### Production Build
Builds the application for production.

`ash
pnpm build
`

### Preview Production Build
Previews the built application.

`ash
pnpm preview
`

## 🧪 Testing

### Unit Tests
Runs unit tests using Vitest.

`ash
pnpm test
`

### E2E Tests
Runs end-to-end tests using Cypress.

`ash
pnpm test:e2e
`

## ⚙️ Configuration

The application uses environment variables for configuration.

*   .env.development: Used during development.
*   .env.production: Used during production build.

**Key Variables:**
*   VITE_API_URL: URL of the backend API.

## 📂 Project Structure

```text
client/
├── cypress/                # End-to-end testing configuration and tests
│   ├── e2e/                # E2E test files
│   ├── reports/            # Test reports
│   ├── screenshots/        # Screenshots from failed tests
│   └── support/            # Cypress support files and commands
├── public/                 # Static assets served directly
├── src/                    # Source code
│   ├── api/                # API client and Axios configuration
│   ├── assets/             # Static assets imported in code (images, fonts)
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context providers (Auth, Theme)
│   ├── pages/              # Page components (views)
│   ├── App.css             # Main application styles
│   ├── App.test.ts         # App component tests
│   ├── App.tsx             # Main application component and routing
│   ├── index.css           # Global CSS styles
│   ├── main.tsx            # Application entry point
│   ├── setupTests.ts       # Test setup configuration
│   └── theme.ts            # Material UI theme configuration
├── cypress.config.ts       # Cypress configuration
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Project dependencies and scripts
├── pnpm-lock.yaml          # Lock file for dependencies
├── pnpm-workspace.yaml     # Workspace configuration
├── tsconfig.app.json       # TypeScript config for app
├── tsconfig.json           # Base TypeScript config
├── tsconfig.node.json      # TypeScript config for Node environment
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest configuration
```
