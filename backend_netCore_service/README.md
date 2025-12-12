# .NET Core Auth Service

This is the authentication and user management service, built with ASP.NET Core 9.0 and MongoDB.

## 🚀 Technologies

*   **Framework**: ASP.NET Core 9.0 Web API
*   **Database**: MongoDB (via Entity Framework Core)
*   **Testing**: xUnit, FluentAssertions, WebApplicationFactory
*   **Documentation**: Swagger / OpenAPI

## 🛠 Setup & Installation

### Prerequisites
*   .NET 9.0 SDK
*   MongoDB (running locally on default port 27017)

### Configuration
Configuration is managed via ppsettings.json and YAML files:
*   dev.appsettings.yaml: Development settings.
*   prod.appsettings.yaml: Production settings.

## 🏃‍♂️ Running the Service

### Restore Dependencies
`ash
dotnet restore
`

### Run Application
Runs the API on http://localhost:5000 and https://localhost:5001.

`ash
cd AuthApi
dotnet run
`

### Run Tests
Executes the integration tests.

`ash
dotnet test
`

## 🔑 Key Features
*   **JWT Authentication**: Secure token-based auth.
*   **Role-Based Access**: Admin and User roles.
*   **Todo Management**: CRUD operations for Todos (linked to Users).
*   **Health Checks**: /health endpoint.

## 📂 Project Structure

```text
backend_netCore_service/
├── AuthApi/                        # Main Web API project
│   ├── Controllers/                # API Controllers
│   │   ├── AuthController.cs       # Authentication endpoints
│   │   └── TodosController.cs      # Todo management endpoints
│   ├── Migrations/                 # EF Core migrations
│   ├── Models/                     # Data models and DTOs
│   │   ├── ApplicationUser.cs      # User entity
│   │   ├── AuthResponse.cs         # Auth response DTO
│   │   ├── LoginRequest.cs         # Login request DTO
│   │   ├── Todo.cs                 # Todo entity
│   │   ├── TodoDtos.cs             # Todo DTOs
│   │   └── TodoUserLink.cs         # User-Todo relationship
│   ├── Options/                    # Configuration options
│   │   └── JwtOptions.cs           # JWT settings class
│   ├── Properties/                 # Project properties
│   │   └── launchSettings.json     # Launch profiles
│   ├── Services/                   # Business logic services
│   │   ├── DatabaseUserService.cs  # DB-based user service
│   │   ├── InMemoryUserService.cs  # In-memory user service (dev)
│   │   ├── ITodoService.cs         # Todo service interface
│   │   ├── ITokenService.cs        # Token service interface
│   │   ├── IUserService.cs         # User service interface
│   │   ├── MongoTodoService.cs     # MongoDB implementation of Todo service
│   │   ├── MongoUserService.cs     # MongoDB implementation of User service
│   │   └── TokenService.cs         # JWT generation service
│   ├── appsettings.Development.json # Dev environment settings (JSON)
│   ├── appsettings.json            # Base settings (JSON)
│   ├── AuthApi.csproj              # Project file
│   ├── AuthApi.http                # HTTP file for testing endpoints
│   ├── AuthDbContext.cs            # EF Core Database Context
│   ├── dev.appsettings.yaml        # Dev environment settings (YAML)
│   ├── prod.appsettings.yaml       # Prod environment settings (YAML)
│   ├── Program.cs                  # Application entry point & DI setup
│   └── SeedData.cs                 # Data seeding logic
├── AuthApi.Tests/                  # Integration tests project
│   ├── AuthApi.Tests.csproj        # Test project file
│   ├── AuthFlowTests.cs            # Auth flow integration tests
│   ├── CustomWebApplicationFactory.cs # Test server factory
│   ├── HealthEndpointTests.cs      # Health check tests
│   ├── TodoTests.cs                # Todo integration tests
│   └── UnitTest1.cs                # Basic unit tests
├── AuthSolution.sln                # Solution file
├── login.json                      # Sample login payload
└── README.md                       # Project documentation
```
