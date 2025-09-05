# Changelog

All notable changes to confytome will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2025-09-05

### Changed
- **Documentation consolidation**: Updated all documentation to reflect current workspace structure
- **Architecture references**: Fixed all outdated references to bin.js → cli.js
- **Package structure**: Updated project structure diagrams for modular workspace
- **Status updates**: Removed "coming soon" references - all packages now available

### Fixed
- **Cross-package documentation**: Synchronized ecosystem references across all READMEs
- **Version consistency**: All packages now at synchronized 1.1.2
- **Workspace dependencies**: Optimized dependency hoisting and removed individual lock files

## [1.1.1] - 2025-09-05

### Fixed
- **CLI naming**: Standardized all packages to use `cli.js` (core package was using `bin.js`)
- **Generator scripts**: Removed redundant generator scripts from core package
- **Test references**: Updated test helpers to use correct CLI file names
- **Peer dependencies**: Updated to ^1.1.1 for consistency

## [1.1.0] - 2025-09-05

### Added
- **Modular architecture**: Restructured into workspace with separate packages
- **Individual packages**: Split generators into @confytome/markdown, @confytome/swagger, @confytome/html, @confytome/postman
- **Workspace scripts**: Added coordinated versioning and publishing workflows
- **Dependency optimization**: Consolidated shared utilities in core, package-specific utilities in generators

### Changed
- **Package structure**: Moved from monolithic to modular workspace structure
- **Publishing**: Each generator now published as separate npm package
- **CLI interfaces**: Each package has its own CLI entry point
- **Dependencies**: Core utilities shared via @confytome/core exports

### Removed
- **Monolithic generators**: No longer bundled in single package
- **Code duplication**: Eliminated ~19,200 lines of duplicated utilities

## [1.0.0] - 2025-09-04

### Added

#### 🚀 Core Features
- **Multi-format documentation generation** from JSDoc comments
- **OpenAPI 3.0.3 specification** generation with full validation
- **Interactive Swagger UI** as self-contained static HTML
- **Professional HTML documentation** with responsive design
- **Confluence-friendly Markdown** with custom Widdershins templates
- **Postman collections** with environment variables
- **Turkish/Unicode character support** throughout all formats

#### 🔧 CLI Interface
- **Comprehensive CLI** with `confytome` command
- **Input validation** with helpful error messages and suggestions
- **Project initialization** via `confytome init`
- **Individual format generation** commands (swagger, html, markdown, postman)
- **All-in-one generation** via `confytome all`
- **Detailed help system** for all commands

#### 🏗️ Architecture
- **OpenAPI-first design** - all generators consume OpenAPI spec
- **Parametric system** - no hardcoded file references
- **Template-based output** with customizable Widdershins templates
- **Centralized error handling** with `ErrorHandler` class
- **Input validation system** with `CliValidator` class
- **Base generator patterns** for consistent implementation

#### 📚 Documentation
- **Comprehensive README** with installation, quickstart, and examples
- **Command reference** with detailed usage instructions
- **Troubleshooting guide** with common issues and solutions
- **Contributing guidelines** for developers
- **Project badges** for npm, license, Node.js version

### Technical Details

#### Dependencies

**Core Dependencies:**
- `commander@14.0.0` - CLI interface framework
- `swagger-jsdoc@6.2.8` - JSDoc to OpenAPI conversion

**Package-Specific Dependencies:**
- `swagger-ui-dist@5.0.0` - Static Swagger UI assets (@confytome/swagger)
- `widdershins@4.0.1` - Markdown template engine (@confytome/markdown)

#### Generated Output Files
- `api-spec.json` - OpenAPI 3.0.3 specification (~25KB)
- `API.md` - Confluence-friendly Markdown (~10KB)
- `api-docs.html` - Professional HTML documentation (~30KB)
- `swagger-ui-static.html` - Interactive Swagger UI (~1.9MB)
- `{API}-v{version}.postman_collection.json` - Postman collection (~15KB)
- `postman_env_vars.json` - Environment variables (~1KB)

#### Project Structure
```
confytome/ (workspace)
├── package.json                # Workspace configuration
└── packages/                   # Modular packages
    ├── core/                   # @confytome/core
    │   ├── cli.js             # CLI entry point
    │   ├── generate-openapi.js # OpenAPI generation
    │   ├── utils/             # Shared utilities
    │   └── templates/         # Project templates
    ├── markdown/              # @confytome/markdown
    ├── swagger/               # @confytome/swagger
    ├── html/                  # @confytome/html
    └── postman/               # @confytome/postman
```

### Features by Category

#### CLI Commands

**Core Package (@confytome/core):**
- `confytome init` - Initialize project structure
- `confytome openapi -c config.json -f files...` - Generate OpenAPI spec
- `confytome generate` - Generate OpenAPI using confytome.json config

**Generator Packages:**
- `npx @confytome/swagger --config confytome.json` - Interactive Swagger UI
- `npx @confytome/html --config confytome.json` - Professional HTML docs
- `npx @confytome/markdown --config confytome.json` - Confluence Markdown
- `npx @confytome/postman --config confytome.json` - Postman collections

#### Validation & Error Handling
- **File existence validation** with helpful error messages
- **JSON configuration validation** with syntax checking
- **JSDoc file validation** with @swagger comment detection
- **Permission checking** with chmod suggestions
- **Environment validation** for required tools

#### Multilingual Support
- **Turkish character preservation** in all output formats
- **Unicode-safe anchor generation** for Markdown navigation
- **Custom Widdershins templates** optimized for Turkish content
- **Confluence-compatible formatting** without HTML tags

### Breaking Changes

N/A - Initial release

### Migration Guide

N/A - Initial release

### Security

- All dependencies kept up to date with security patches
- No credentials or sensitive data processing
- File permission validation prevents unauthorized access
- JSON parsing with error handling prevents injection

---

## Development

### Version 1.1.2 Development Timeline

- **Initial Release (1.0.0)**: OpenAPI-first monolithic architecture
- **Modular Restructure (1.1.0)**: Split into workspace with separate packages
- **Standardization (1.1.1)**: CLI naming consistency and cleanup
- **Documentation (1.1.2)**: Complete documentation consolidation and accuracy

### Architecture Evolution

- **1.0.0**: Monolithic package with all generators bundled
- **1.1.0**: Modular workspace - separated into @confytome/* packages
- **1.1.1**: Standardized CLI interfaces and removed redundancy  
- **1.1.2**: Documentation accuracy and workspace optimization

### Current Status

**Released Packages (1.1.2):**
- ✅ @confytome/core - OpenAPI specification generation
- ✅ @confytome/markdown - Confluence-friendly Markdown docs  
- ✅ @confytome/swagger - Interactive Swagger UI
- ✅ @confytome/html - Professional HTML documentation
- ✅ @confytome/postman - Postman collections with environment variables

**Architecture:**
- ✅ Modular workspace structure with npm workspaces
- ✅ Synchronized versioning and coordinated releases
- ✅ Clean separation of concerns between packages
- ✅ Comprehensive test suite (14 tests passing)
- ✅ Professional development workflows
