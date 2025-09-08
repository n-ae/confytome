# 🔌 confytome

[![npm version](https://badge.fury.io/js/%40confytome%2Fcore.svg)](https://badge.fury.io/js/@confytome/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Code Style: ESM](https://img.shields.io/badge/code%20style-ESM-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

Plugin-based API documentation generator with OpenAPI-first architecture. Generates multiple formats from JSDoc comments through an extensible generator registry system.

## ✨ Key Features

- 🔌 **Plugin Architecture** - Extensible generator system with automatic discovery
- 📊 **Multiple Formats** - HTML, Markdown, Swagger UI, and Postman collections
- 🚀 **OpenAPI-First** - Generate comprehensive specs from JSDoc comments
- ⚡ **Standalone Packages** - Each generator works independently
- 🎨 **Professional Output** - Beautiful, responsive documentation
- 🌍 **Unicode Support** - Full international character support
- 🔧 **Developer Friendly** - Simple CLI with intuitive commands

## 🚀 Quick Start

### Global Installation

```bash
# Install the core system
npm install -g @confytome/core

# Generate OpenAPI spec from your code
confytome openapi -c confytome.json

# Generate documentation in multiple formats
npx @confytome/html --spec ./docs/api-spec.json
npx @confytome/markdown --spec ./docs/api-spec.json
npx @confytome/swagger --spec ./docs/api-spec.json
npx @confytome/postman --spec ./docs/api-spec.json
```

### Standalone Usage

```bash
# Use any generator independently with existing OpenAPI specs
npx @confytome/markdown --spec ./path/to/your-spec.json --output ./docs
npx @confytome/html --spec ./path/to/your-spec.json --output ./docs
```

## 📦 Package Ecosystem

| Package | Purpose | Installation | Documentation |
|---------|---------|--------------|---------------|
| **[@confytome/core](https://npmjs.com/package/@confytome/core)** | Plugin system & OpenAPI generator | `npm i -g @confytome/core` | [📚 Docs](./packages/core/README.md) |
| **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** | Confluence-friendly Markdown | `npm i -g @confytome/markdown` | [📚 Docs](./packages/markdown/README.md) |
| **[@confytome/html](https://npmjs.com/package/@confytome/html)** | Professional HTML docs | `npm i -g @confytome/html` | [📚 Docs](./packages/html/README.md) |
| **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** | Interactive Swagger UI | `npm i -g @confytome/swagger` | [📚 Docs](./packages/swagger/README.md) |
| **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** | Postman collections | `npm i -g @confytome/postman` | [📚 Docs](./packages/postman/README.md) |

## 🎯 Usage Scenarios

### Complete Workflow (Recommended)

```bash
# 1. Initialize project
confytome init

# 2. Generate OpenAPI spec from JSDoc
confytome openapi -c confytome.json

# 3. Generate all documentation formats
confytome run-all
```

### Standalone Documentation Generation

Perfect when you already have OpenAPI specifications:

```bash
# Generate specific format
npx @confytome/html --spec ./api-spec.json --output ./docs

# Generate multiple formats
npx @confytome/html --spec ./api-spec.json --output ./docs
npx @confytome/markdown --spec ./api-spec.json --output ./docs
npx @confytome/postman --spec ./api-spec.json --output ./docs
```

### CI/CD Integration

```bash
# Generate docs in CI pipeline
npx @confytome/core openapi -c confytome.json
npx @confytome/html --spec ./docs/api-spec.json --output ./dist/docs
npx @confytome/markdown --spec ./docs/api-spec.json --output ./dist/docs
```

## 🏗️ Architecture

```mermaid
graph TB
    CLI[CLI Commands] --> Core[@confytome/core]
    Core --> Registry[Generator Registry]
    Registry --> Factory[Generator Factory]
    Factory --> Services[Service Layer]
    Services --> Generators[Generator Plugins]

    Services --> Branding[Branding Service]
    Services --> Version[Version Service]
    Services --> Template[Template Service]

    Generators --> HTML[HTML Generator]
    Generators --> Markdown[Markdown Generator]
    Generators --> Swagger[Swagger Generator]
    Generators --> Postman[Postman Generator]
```

### Plugin System Features

- **Automatic Discovery** - Workspace and external plugin detection
- **Dependency Injection** - Shared services across all generators
- **Plugin Validation** - Comprehensive compatibility checking
- **Service Layer** - Centralized branding, versioning, and templating

## 📚 Documentation

### Core Documentation
- [**Plugin System Guide**](./PLUGIN-SYSTEM.md) - Comprehensive plugin development
- [**Architecture Documentation**](./docs/README.md) - System design and patterns
- [**Contributing Guide**](./CONTRIBUTING.md) - Development workflow

### Generator Documentation
Each package includes comprehensive documentation:
- Installation and usage instructions
- CLI options and examples
- Output format specifications
- Troubleshooting guides

### Template Systems
- **Mustache Templates** - Logic-less templating for documentation
- **CLI Templates** - Consistent command-line interfaces
- **README Templates** - Automated documentation generation

## 💡 Examples

### JSDoc to Multiple Formats

**Input** (`routes/users.js`):
```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/api/users', (req, res) => {
  // Your code here
});
```

**Generated Output:**
- `api-spec.json` - OpenAPI 3.0.3 specification
- `api-docs.html` - Professional HTML documentation
- `api-docs.md` - Confluence-friendly Markdown
- `api-swagger.html` - Interactive Swagger UI
- `api-postman.json` - Postman collection

### Project Structure

```
your-project/
├── confytome.json          # Configuration
├── docs/                   # Generated documentation
│   ├── api-spec.json      # OpenAPI specification
│   ├── api-docs.html      # HTML documentation
│   ├── api-docs.md        # Markdown documentation
│   ├── api-swagger.html   # Swagger UI
│   └── api-postman.json   # Postman collection
└── src/
    └── routes/            # Your API routes with JSDoc
```

## 🛠️ Development

### Requirements
- Node.js ≥ 18
- npm or yarn
- ESM module support

### Local Development

```bash
# Clone repository
git clone https://github.com/n-ae/confytome.git
cd confytome

# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint
```

### Plugin Development

Create custom generators by extending the base classes:

```javascript
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

export class MyCustomGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services) {
    super('my-generator', 'Generating custom format', outputDir, services);
  }

  async generate() {
    // Your generation logic
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Areas for Contribution
- New generator plugins
- Template improvements
- Documentation enhancements
- Bug fixes and optimizations
- Integration examples

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/n-ae/confytome/issues)
- 💬 [Discussions](https://github.com/n-ae/confytome/discussions)

---

**Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.**
