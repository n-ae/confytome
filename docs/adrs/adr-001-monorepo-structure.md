# ADR-001: Monorepo Structure with Shared Core

## Status
Accepted

## Context
The confytome project needs to support multiple output formats (HTML, Markdown, Swagger UI, Postman collections) while maintaining consistency and avoiding code duplication. Different approaches were considered for organizing the codebase:

1. Separate repositories for each generator
2. Single repository with all generators
3. Monorepo with shared core and separate packages

## Decision
We chose a monorepo structure with a shared core package and separate packages for each generator:

```
confytome/
├── packages/
│   ├── core/           # Shared utilities, base classes, OpenAPI generation
│   ├── html/           # HTML documentation generator
│   ├── markdown/       # Markdown documentation generator
│   ├── swagger/        # Swagger UI generator
│   └── postman/        # Postman collection generator
├── docs/               # Project documentation
└── package.json        # Workspace configuration
```

## Consequences

### Positive
- **Code Reuse**: Shared utilities, base classes, and common functionality in core
- **Consistency**: All generators follow the same patterns and interfaces
- **Independent Versioning**: Each package can be versioned independently
- **Reduced Bundle Size**: Users only install the generators they need
- **Development Efficiency**: Changes to core immediately available to all packages
- **Testing**: Shared test utilities and consistent testing patterns

### Negative
- **Build Complexity**: Requires workspace management and inter-package dependencies
- **Release Coordination**: Core changes may require coordinated releases
- **Learning Curve**: Developers need to understand the package structure

## Alternatives Considered

### Single Repository
- **Pros**: Simple structure, single npm package
- **Cons**: Large bundle size, all-or-nothing installation, harder to maintain different release cycles

### Separate Repositories
- **Pros**: Complete independence, specialized teams
- **Cons**: Code duplication, inconsistent interfaces, harder to maintain shared functionality

## Implementation Details

- Using npm workspaces for package management
- Core package provides base classes, utilities, and OpenAPI generation
- Each generator package extends base classes for consistency
- Shared test helpers and fixtures in core package
- Independent CLI entry points for each generator package