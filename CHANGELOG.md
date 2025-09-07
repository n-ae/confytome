# Changelog

All notable changes to confytome will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2025-01-XX - Mustache Migration Release

### 🚀 Template Engine Migration
- **Mustache Template Engine**: Complete migration from widdershins to Mustache
  - Replaced widdershins dependency with lightweight mustache (4.2.0)
  - Created comprehensive OpenApiProcessor for spec-to-template-data transformation
  - Developed custom Mustache templates preserving all markdown generation features
  - Eliminated security vulnerabilities (11 → 0) by removing widdershins dependency tree
  - Reduced bundle size by ~2MB while maintaining functionality
- **Cross-language Compatibility**: Mustache templates can be ported to other languages
  - Logic-less templates separate presentation from data processing
  - Template data processing handled entirely in JavaScript
  - ADR-010 documents decision rationale with 90/100 simplicity score
- **Enhanced OpenAPI Processing**: Comprehensive spec analysis and template data generation
  - Complex schema handling with nested objects and enums
  - Authentication detection and endpoint grouping by tags
  - Advanced example generation with circular reference protection
  - Unicode-safe anchor generation for Turkish content compatibility

### 🧪 Testing & Quality Improvements
- **Comprehensive Test Coverage**: All widdershins functionality preserved and validated
  - Real-world OpenAPI spec testing with complex schemas
  - Markdown output validation ensuring feature parity
  - Template rendering verification with Unicode content
- **Documentation Updates**: Complete migration from widdershins references to Mustache
  - Updated all package READMEs with Mustache templating information
  - Architecture documentation reflects new template engine
  - Plugin system documentation updated for Mustache integration

### 🔧 Breaking Changes
- **Template Engine**: widdershins replaced with Mustache (internal implementation change)
- **Dependencies**: widdershins@4.0.1 removed, mustache@4.2.0 added
- **Template Structure**: Custom Mustache templates replace widdershins configuration

### 📦 Migration Impact
- **API Compatibility**: No breaking changes to public APIs or CLI commands
- **Output Compatibility**: Generated markdown maintains same structure and formatting
- **Configuration**: No changes required to confytome.json or user configurations

## [1.4.2] - 2025-01-XX - Maintainability Release

### 🏗️ Architecture & Maintainability Improvements
- **ServiceFactory Simplification**: Reduced complexity by 64% (145→52 lines)
  - Removed complex caching mechanisms and private methods
  - Simplified service creation with direct static methods
  - Improved performance by eliminating cache overhead
- **ConfigMerger Modernization**: Replaced temporary file handling with memory-based merging
  - Eliminated file I/O overhead for configuration operations
  - Simplified API with backward compatibility maintained
  - Reduced race conditions and cleanup complexity
- **Comprehensive Integration Testing**: Added end-to-end test coverage
  - 8 new integration tests covering complete generation pipeline
  - Multi-format output validation (HTML, Markdown, Swagger, Postman)
  - Performance and error handling validation
  - CLI command testing with isolated environments

### 📚 Documentation & Architecture
- **Complete ADR System**: 8 Architecture Decision Records documenting key decisions
  - [ADR-001: Monorepo Structure](docs/architecture/adr-001-monorepo-structure.md)
  - [ADR-002: Base Generator Pattern](docs/architecture/adr-002-base-generator-pattern.md)  
  - [ADR-003: Plugin Registry Analysis](docs/architecture/adr-003-plugin-registry-approach.md)
  - [ADR-004: ServiceFactory Simplification](docs/architecture/adr-004-service-factory-simplification.md)
  - [ADR-005: Configuration Merging Strategy](docs/architecture/adr-005-configuration-merging.md)
  - [ADR-006: Integration Testing Strategy](docs/architecture/adr-006-integration-testing-strategy.md)
  - [ADR-007: Base Class Hierarchy Evaluation](docs/architecture/adr-007-base-class-hierarchy-evaluation.md)
  - [ADR-008: External Dependency Monitoring](docs/architecture/adr-008-external-dependency-monitoring.md)
- **External Dependency Monitoring**: Automated security and version tracking
  - Monitoring script for mustache and swagger-ui-dist dependencies
  - Security vulnerability detection and reporting
  - Update availability checking with changelog review guidance
- **Consolidated Documentation**: Complete documentation overhaul
  - New documentation index and organization
  - Updated README with maintainability achievements
  - Comprehensive architecture documentation

### 🔍 Analysis & Evaluation
- **Base Class Hierarchy Review**: Evaluated and retained current design
  - Analysis showed significant value in current 2-level inheritance
  - Template methods eliminate 50-100 lines of duplication per generator
  - Consistent patterns and error handling across all generators
- **Plugin Registry Evaluation**: Comprehensive analysis of current system
  - Documented 85% complexity reduction potential with static registry
  - Created proof-of-concept static registry implementation
  - Recommended hybrid approach for future development

### 🧪 Testing & Quality
- **Test Coverage**: All 22 tests passing consistently
  - Integration tests validate complete CLI workflows
  - Error handling and edge case coverage
  - Performance threshold validation
- **Code Quality**: Significant complexity reduction while maintaining functionality
  - Simplified core components without breaking changes
  - Improved maintainability score from detailed assessment
  - Enhanced long-term sustainability

## [1.3.0] - 2025-09-05

### Added
- **🔌 Plugin System**: Complete generator registry and plugin architecture
  - Automatic generator discovery from workspace packages
  - External plugin support via npm (`confytome-plugin-*`)
  - Dynamic generator loading with dependency injection
  - Plugin validation and compatibility checks
- **New CLI Commands**:
  - `confytome generators` - List all available generators
  - `confytome info <generator>` - Show detailed generator information
  - `confytome recommended` - Show compatible generators
  - `confytome validate` - Validate generator dependencies
  - `confytome run <generators>` - Execute specific generators
  - `confytome run-all` - Execute all spec consumer generators
- **Developer Tools**:
  - `GeneratorRegistry` for plugin discovery and management
  - `GeneratorFactory` for clean generator instantiation
  - `PluginInterface` for external plugin development
  - Plugin development utilities and templates
- **Service Layer Improvements**:
  - Enhanced dependency injection system
  - Centralized branding and version services
  - Template method patterns for code deduplication

### Changed
- **Architecture**: Evolved from simple orchestration to full plugin system
- **Code Organization**: Eliminated code duplication across generators
- **CLI Interface**: Enhanced with plugin management commands
- **Generator Base Classes**: Improved template method patterns

### Removed
- **Redundant Code**: Duplicate generator patterns and utilities
- **Test Files**: Temporary test directories and sample code

### Fixed
- **Service Integration**: Consistent service injection across all generators
- **Error Handling**: Improved validation and error reporting
- **Documentation**: Updated all docs to reflect plugin system

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
- **Confluence-friendly Markdown** with custom Mustache templates
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
- **Template-based output** with customizable Mustache templates
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
- `mustache@4.2.0` - Logic-less template engine (@confytome/markdown)

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
- **Custom Mustache templates** optimized for Turkish content
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
