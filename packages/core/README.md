# @confytome/core

[![Build](https://github.com/n-ae/confytome/workflows/CI/badge.svg)](https://github.com/n-ae/confytome/actions)
[![Coverage](https://codecov.io/gh/n-ae/confytome/branch/main/graph/badge.svg)](https://codecov.io/gh/n-ae/confytome)
[![GitHub issues](https://img.shields.io/github/issues/n-ae/confytome)](https://github.com/n-ae/confytome/issues)
[![npm version](https://badge.fury.io/js/%40confytome%2Fcore.svg)](https://badge.fury.io/js/@confytome/core)
[![Downloads](https://img.shields.io/npm/dw/@confytome/core.svg)](https://www.npmjs.com/package/@confytome/core)
[![Node](https://img.shields.io/node/v/@confytome/core.svg)](https://www.npmjs.com/package/@confytome/core)
[![License](https://img.shields.io/npm/l/@confytome/core.svg)](https://www.npmjs.com/package/@confytome/core)

Core plugin system and OpenAPI 3.1.0 generator from JSDoc comments. Plugin registry, service layer, and CLI for extensible API documentation generation.

## ✨ Core Features

- 🔌 **Plugin Registry System** - Automatic generator discovery and management
- 📊 **OpenAPI 3.1.0 Generation** - JSDoc to OpenAPI specification conversion
- 🎯 **Service Layer** - Centralized branding, versioning, and templating
- 🔧 **CLI Interface** - Comprehensive command-line tools
- 📝 **Project Initialization** - Quick project setup with templates
- 🧪 **Testing Framework** - Complete test coverage for all components

## 🚀 Installation

```bash
# Global installation (recommended)
npm install -g @confytome/core

# Local project installation
npm install @confytome/core
```

## 📋 Commands

### Core Generation Commands

```bash
# Initialize new confytome project
confytome init

# Generate OpenAPI specification from JSDoc
confytome openapi -c confytome.json -f src/routes/*.js

# Generate using project config
confytome generate
```

### Plugin Management Commands

```bash
# List all available generators
confytome generators

# Get detailed generator information
confytome info <generator-name>

# Validate generator dependencies
confytome validate

# Run specific generators
confytome run <generator1> <generator2>

# Run all spec consumer generators
confytome run-all
```

## ⚙️ Configuration

### Project Configuration (`confytome.json`)

```json
{
  "serverConfig": "./serverConfig.json",
  "inputFiles": [
    "src/routes/**/*.js",
    "src/models/**/*.js"
  ],
  "outputDir": "./docs",
  "excludeBrand": false
}
```

### Server Configuration (`serverConfig.json`)

```json
{
  "info": {
    "title": "My API",
    "version": "1.0.0",
    "description": "API documentation"
  },
  "servers": [
    {
      "url": "https://api.example.com",
      "description": "Production server"
    }
  ]
}
```

## 🏗️ Plugin-First Architecture

The core package implements a **plugin-based approach with automatic discovery and dependency injection**:

### Plugin Registry System
- **Automatic Discovery** - Scans workspace packages and external npm modules
- **Manifest Validation** - Validates plugin compatibility and dependencies
- **Dynamic Loading** - Loads generators on-demand with proper error handling

### Service Layer
- **BrandingService** - Consistent branding across all generators
- **VersionService** - Centralized version management
- **TemplateService** - Template processing and management

### Generator Factory
- **Dependency Injection** - Provides services to generator instances
- **Error Handling** - Comprehensive error reporting and recovery
- **Plugin Isolation** - Safe execution environment for external plugins

## 📦 Generated Files

| File | Description | Size |
|------|-------------|------|
| `api-spec.json` | OpenAPI 3.1.0 specification | ~25KB |
| `confytome.json` | Project configuration | ~1KB |
| `serverConfig.json` | API server configuration | ~2KB |

## 💡 Usage Examples

### Basic OpenAPI Generation

```bash
# From JSDoc comments in your routes
confytome openapi \\
  --config ./confytome.json \\
  --files "src/routes/*.js"
```

### Advanced Plugin Usage

```bash
# Run specific generators
confytome run html markdown

# Get plugin information
confytome info html

# List all available plugins
confytome generators
```

### Programmatic Usage

```javascript
import { GeneratorRegistry } from '@confytome/core/services/GeneratorRegistry.js';
import { GeneratorFactory } from '@confytome/core/services/GeneratorFactory.js';

// Initialize registry
const registry = new GeneratorRegistry();
await registry.initialize();

// Create generator instance
const htmlGenerator = await GeneratorFactory.createGenerator('html', './docs');
await htmlGenerator.generate();
```

## 🧪 Plugin Development

### Creating New Generators

```javascript
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

export class MyGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services) {
    super('my-generator', 'Generating custom format', outputDir, services);
  }

  async generate() {
    return this.generateDocument('myformat', 'api-docs.myformat', (spec, services) => {
      // Your generation logic here
      return this.processOpenAPISpec(spec);
    });
  }
}
```

### Plugin Manifest (`confytome-plugin.json`)

```json
{
  "name": "my-generator",
  "type": "spec-consumer",
  "description": "My custom documentation generator",
  "main": "./generate-my-format.js",
  "className": "MyGenerator",
  "version": "1.0.0",
  "standalone": true
}
```

## 🔧 API Reference

### Core Services

#### GeneratorRegistry
```javascript
const registry = new GeneratorRegistry();
await registry.initialize();

// Get all generators
const generators = registry.getAllGenerators();

// Validate generator
const validation = registry.validateGenerator('html');
```

#### GeneratorFactory
```javascript
// Create generator instance
const generator = await GeneratorFactory.createGenerator('html', './docs', options);

// Execute generator
const result = await GeneratorFactory.executeGenerator('markdown');
```

#### Service Layer
```javascript
import { BrandingService, VersionService } from '@confytome/core/services/index.js';

// Access services in generators
const branding = new BrandingService({ excludeBrand: false });
const version = new VersionService();
```

## 🛠️ Development & Testing

### Running Tests

```bash
# Run all core tests
npm run test:core

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Development Scripts

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Regenerate CLI templates
npm run regenerate:cli
```

## 🔍 Debugging

### Verbose Output

```bash
# Enable debug logging
DEBUG=confytome:* confytome openapi -c confytome.json
```

### Common Issues

#### Plugin Not Found
```bash
# Validate plugin discovery
confytome generators

# Check plugin manifest
confytome info <plugin-name>
```

#### Generation Errors
```bash
# Validate dependencies
confytome validate

# Check input files
confytome openapi --files "src/**/*.js" --dry-run
```

## 🌟 Ecosystem Integration

@confytome/core works seamlessly with generator packages:

- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML documentation
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

### External Plugins

Create external plugins following the `confytome-plugin-*` naming convention:

```bash
npm install confytome-plugin-custom
confytome run custom
```

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.**
