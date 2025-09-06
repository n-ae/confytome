# @confytome/core

[![npm version](https://badge.fury.io/js/%40confytome%2Fcore.svg)](https://badge.fury.io/js/@confytome/core)\n[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)\n[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)\n[![Code Style: ESM](https://img.shields.io/badge/code%20style-ESM-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

Core plugin system and OpenAPI 3.0.3 generator from JSDoc comments. Plugin registry, service layer, and CLI for extensible API documentation generation.

## 🏗️ Plugin-First Architecture

@confytome/core uses a **plugin-based approach with automatic discovery and dependency injection**:

- **Plugin Registry** - Automatic discovery and loading of generator plugins
- **Service Layer** - Centralized OpenAPI spec generation and validation
- **Dependency Injection** - Clean separation of concerns between core and generators
- **Configuration Management** - Unified config handling across all plugins
- **CLI Framework** - Commander-based CLI with consistent argument parsing
- **Error Handling** - Comprehensive error reporting with helpful messages

## ✨ Core Features

- 🔌 **Plugin System** - Extensible architecture with automatic plugin discovery
- 📝 **JSDoc Integration** - Generate OpenAPI 3.0.3 specs from existing comments
- 🎯 **Multiple Generators** - Support for Swagger UI, HTML, Markdown, and Postman
- ⚙️ **Configuration-driven** - JSON-based configuration with sensible defaults
- 🛠️ **CLI Tools** - Command-line interface for all operations
- 📊 **Validation** - Built-in OpenAPI spec validation and error reporting
- 🔄 **Live Reload** - Development mode with automatic regeneration
- 📦 **NPX Ready** - Use without installation via npx

## 📦 Installation

### Global Installation (Recommended)

```bash
# Install globally for CLI access
npm install -g @confytome/core

# Verify installation
confytome --version
```

### NPX Usage (No Installation Required)

```bash
# Use without installing
npx @confytome/core --help
npx @confytome/core {{COMMON_COMMAND}}
```

### Local Development

```bash
# Clone and install
git clone https://github.com/n-ae/confytome.git
cd confytome
npm install

# Use locally (workspace development)
node packages/core/cli.js --help
```

## 🎯 Try the Demo

Experience confytome with minimal setup:

```bash
# Try with the included example
npx @confytome/core --help

# Generate OpenAPI spec from JSDoc comments
npx @confytome/core --input ./src --output ./docs

# Use with configuration file
npx @confytome/core --config ./confytome.json
```

## 🚀 Quick Start

### 1. Basic OpenAPI Generation
```bash
# Generate OpenAPI spec from JSDoc comments
npx @confytome/core --input ./src --output ./docs
```

### 2. With Configuration File
```json
// confytome.json
{
  "input": "./src",
  "output": "./docs",
  "info": {
    "title": "My API",
    "version": "1.0.0",
    "description": "API documentation generated from JSDoc"
  }
}
```

```bash
npx @confytome/core --config ./confytome.json
```

## 📚 Command Reference

| Option | Short | Description | Default |
|--------|-------|-------------|----------|
| `--config` | `-c` | Path to confytome.json config file | `./confytome.json` |
| `--input` | `-i` | Input directory to scan for JSDoc comments | `./src` |
| `--output` | `-o` | Output directory for generated files | `./docs` |
| `--watch` | `-w` | Watch mode for development | `false` |
| `--verbose` | `-v` | Verbose logging output | `false` |
| `--version` | `-V` | Show version number | |
| `--help` | `-h` | Show help information | |

## 📄 Configuration

Create a `confytome.json` file in your project root:

```json
{
  "input": "./src",
  "output": "./docs",
  "info": {
    "title": "My API Documentation",
    "version": "1.0.0",
    "description": "Generated API documentation"
  },
  "servers": [
    {
      "url": "https://api.example.com",
      "description": "Production server"
    }
  ],
  "plugins": {
    "generators": ["swagger", "html", "markdown"]
  }
}
```

## 💡 Examples

### JSDoc to OpenAPI Example

```javascript
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.get('/users/:id', getUserById);
```

Generated OpenAPI spec:
```json
{
  "paths": {
    "/users/{id}": {
      "get": {
        "summary": "Get user by ID",
        "parameters": [...],
        "responses": {...}
      }
    }
  }
}
```

## 📁 Generated Output

```
docs/
├── api-spec.json      # OpenAPI 3.0.3 specification
├── api-docs.html      # Professional HTML documentation
├── api-swagger.html   # Interactive Swagger UI
├── api-docs.md        # Confluence-friendly Markdown
└── postman-collection.json  # Postman collection
```

All files are generated based on your configuration and installed plugins.

## 🛠️ Troubleshooting

### Common Issues

#### "No JSDoc comments found"
```bash
# Check your input directory
ls -la ./src

# Use verbose mode for debugging
npx @confytome/core --input ./src --verbose
```

#### "Plugin not found"
```bash
# Install required plugins
npm install -g @confytome/html @confytome/swagger

# Or use npx (plugins will be installed automatically)
npx @confytome/core --config ./confytome.json
```

#### Configuration errors
```bash
# Validate your configuration
npx @confytome/core --config ./confytome.json --verbose
```

## 🏗️ Architecture

```
@confytome/core
├── lib/
│   ├── plugin-registry.js    # Plugin discovery and loading
│   ├── spec-generator.js     # OpenAPI spec generation
│   ├── config-manager.js     # Configuration handling
│   └── cli.js               # Command-line interface
├── plugins/
│   └── generators/          # Built-in generator plugins
└── examples/               # Sample configurations
```

### Plugin System
- **Automatic Discovery**: Plugins are discovered via npm package naming convention
- **Dependency Injection**: Clean interfaces between core and plugins  
- **Configuration-driven**: Plugin behavior controlled via confytome.json
- **Extensible**: Easy to create custom generators

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/n-ae/confytome/blob/main/CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/n-ae/confytome.git
cd confytome
npm install
npm run test
```

### Creating Plugins
```bash
# Create a new generator plugin
npm init @confytome/plugin-my-generator
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAPI Initiative](https://www.openapis.org/) for the OpenAPI specification
- [JSDoc](https://jsdoc.app/) for documentation comment standards
- [Commander.js](https://github.com/tj/commander.js/) for CLI framework
- [Swagger UI](https://swagger.io/tools/swagger-ui/) for interactive documentation
- All contributors who help make confytome better

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/n-ae/confytome/issues)
- 📖 **Documentation**: This README and inline help (`confytome --help`)

---

**Made with ❤️ for developers who value great API documentation**

*Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.*