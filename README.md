# 🔌 confytome

[![npm version](https://badge.fury.io/js/%40confytome%2Fcore.svg)](https://badge.fury.io/js/@confytome/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Code Style: ESM](https://img.shields.io/badge/code%20style-ESM-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

**Plugin-based API documentation generator** with OpenAPI-first architecture. Generates multiple formats from JSDoc comments through an extensible generator registry system.

## 🔌 Plugin-First Architecture

confytome uses a **plugin-based approach** with automatic discovery and dependency injection:

### Core System
- **`@confytome/core`** - Plugin registry, service layer, and OpenAPI generator
  - 🔍 **Generator Registry**: Automatic plugin discovery from workspace and npm
  - 🏗️ **Service Layer**: Dependency injection with branding, versioning, templates
  - ⚙️ **CLI Commands**: Plugin management (`generators`, `info`, `validate`, `run`)

### Available Plugins
- **`@confytome/markdown`** - Confluence-friendly Markdown docs ✅ [Available](https://npmjs.com/package/@confytome/markdown)
- **`@confytome/swagger`** - Interactive Swagger UI ✅ [Available](https://npmjs.com/package/@confytome/swagger)
- **`@confytome/postman`** - Postman collections ✅ [Available](https://npmjs.com/package/@confytome/postman)
- **`@confytome/html`** - Professional HTML docs ✅ [Available](https://npmjs.com/package/@confytome/html)

### External Plugin Support
- **Custom Plugins**: Follow `confytome-plugin-*` naming convention
- **Auto-Discovery**: Automatic loading and validation
- **Service Integration**: Access to core services through dependency injection

## ✨ Core Features

- 🔌 **Plugin Registry System** - Automatic discovery and dependency injection
- 📝 **OpenAPI 3.0.3 specification** generation with validation
- 🌍 **Server overrides** via standard JSDoc `servers:` field
- ⚙️ **Plugin Management CLI** - List, validate, and execute generators
- 🏗️ **Service Layer** - Shared branding, versioning, and template services
- 🔧 **Extensible Architecture** - Easy plugin development with base classes
- 🔄 **Pure OpenAPI standards** - No custom fields, works with all tools

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
npx @confytome/core init
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

Want to see confytome in action? Generate complete demo documentation in seconds:

```bash
# Generate demo with plugin system
confytome demo

# Or specify custom output directory  
confytome demo --output ./my-demo

# Plugin management commands
confytome generators      # List all available plugins
confytome validate        # Check plugin compatibility
```

This creates a complete API documentation suite with:
- **📄 OpenAPI Spec** - Machine-readable API specification
- **🎨 HTML Docs** - Professional styled documentation  
- **⚡ Swagger UI** - Interactive API explorer
- **📝 Markdown** - Confluence-friendly documentation
- **📮 Postman** - Collection + environment for API testing

The demo includes realistic API endpoints:
- **🔐 Authentication** - Login/logout with JWT tokens (server override example)
- **👥 User Management** - CRUD operations with pagination
- **🌐 Multiple Environments** - Production, staging, development servers

**📂 Generated Files:**
```
docs/
├── api-spec.json        # OpenAPI 3.0.3 specification (20KB)
├── api-docs.html        # Professional HTML documentation (12KB)  
├── api-swagger.html     # Interactive Swagger UI (1.8MB self-contained)
├── api-docs.md          # Confluence-ready Markdown (12KB)
├── api-postman.json     # Postman collection (8KB)
└── api-postman-env.json # Postman environment variables (4KB)
```

**🌟 Open `api-swagger.html` in your browser to explore the interactive API!**

## 🚀 Quick Start

### Option 1: Plugin System Approach (Recommended) 🌟

#### 1. Initialize Your Project

```bash
# Create project structure with plugin support
confytome init

# This creates:
# - docs/ directory
# - confytome.json (plugin system config)
# - serverConfig.json (OpenAPI config)
# - example-router.js (JSDoc examples)
```

#### 2. Configure Routes and Servers

Edit the generated `confytome.json`:

```json
{
  "serverConfig": "serverConfig.json",
  "routeFiles": [
    "routes/auth.js", 
    "routes/users.js",
    "routes/orders.js"
  ]
}
```

#### 3. Manage Plugins

```bash
# List available generators
confytome generators

# Validate plugin compatibility
confytome validate

# Get detailed plugin information
confytome info generate-html
```

#### 4. Generate All Documentation

```bash
# Generate all documentation using plugin system
confytome generate

# Or with custom config
confytome generate --config my-confytome.json --output ./api-docs
```

### Option 2: Granular Plugin Control

#### 1. Configure Your API

Edit the generated `serverConfig.json`:

```json
{
  "info": {
    "title": "My Awesome API",
    "version": "1.0.0",
    "description": "A comprehensive API for my application"
  },
  "servers": [
    {
      "url": "https://api.example.com/v1",
      "description": "Production server"
    }
  ]
}
```

### 3. Add JSDoc Comments to Your Routes

#### Standard Routes (Default - Recommended)

Most routes should use the default server from `serverConfig.json` and don't need any server override:

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with pagination
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 * # No servers field = uses default server from serverConfig.json
 */
router.get('/users', getUsersHandler);
```

#### Routes with Custom Server Override (Special Cases)

Only use server overrides when a route needs a different server (like auth routes that bypass API versioning):

```javascript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     servers:
 *       - url: http://localhost:3000
 *         description: Auth Server (no base path)
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.post('/auth/login', loginHandler);
```

### 4. Generate with Individual Plugins

```bash
# First generate OpenAPI spec
confytome openapi -c serverConfig.json -f routes/users.js routes/auth.js

# Then run specific plugins
confytome run generate-html generate-markdown
confytome run generate-swagger generate-postman

# Or run all spec consumers
confytome run-all
```

## 📚 Command Reference

### Plugin System Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `generators` | List available plugins | `confytome generators` |
| `info <plugin>` | Show plugin details | `confytome info generate-html` |
| `validate` | Check plugin compatibility | `confytome validate` |
| `run <plugins>` | Execute specific plugins | `confytome run generate-html generate-markdown` |
| `run-all` | Execute all spec consumers | `confytome run-all` |

### Core Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `demo` | 🎯 Generate demo with plugin system | `confytome demo` |
| `init` | Initialize project structure | `confytome init` |
| `generate` | 🌟 Generate using confytome.json | `confytome generate` |
| `openapi` | Generate OpenAPI specification | `confytome openapi -c config.json -f file1.js file2.js` |
| `all` | Legacy: Generate all formats | `confytome all -c config.json -f file1.js file2.js` |

### Legacy Individual Commands

| Command | Description | Prerequisites |
|---------|-------------|---------------|
| `swagger` | Generate Swagger UI HTML | OpenAPI spec |
| `html` | Generate styled HTML docs | OpenAPI spec |
| `markdown` | Generate Markdown docs | OpenAPI spec |
| `postman` | Generate Postman collection | OpenAPI spec |

### Command Options

```bash
# OpenAPI generation options
confytome openapi -c <config> -f <files...>
  -c, --config <path>     Server configuration JSON file (required)
  -f, --files <files...>  JSDoc files to process (required)

# All formats generation
confytome all -c <config> -f <files...>
  # Same options as openapi command
  # Generates: OpenAPI → HTML → Swagger → Markdown → Postman

# Help for any command
confytome <command> --help
confytome --help
```

## 📄 confytome.json Configuration

The `confytome.json` file provides a simplified way to configure your documentation generation:

### Basic Structure

```json
{
  "serverConfig": "serverConfig.json",
  "routeFiles": [
    "routes/auth.js",
    "routes/users.js",
    "https://raw.githubusercontent.com/user/repo/main/routes/api.js"
  ]
}
```

### Configuration Options

| Field | Type | Description |
|-------|------|-------------|
| `serverConfig` | string | Path to your OpenAPI server configuration file |
| `routeFiles` | array | Array of route file paths (local, absolute, or network URLs) |

### Route File Types

**Local relative paths:**
```json
{
  "routeFiles": ["routes/users.js", "routes/auth.js"]
}
```

**Absolute paths:**
```json
{
  "routeFiles": ["/full/path/to/routes.js"]
}
```

**Network URLs:**
```json
{
  "routeFiles": ["https://raw.githubusercontent.com/user/repo/main/routes.js"]
}
```

### Server Overrides with Pure OpenAPI

Use standard OpenAPI `servers:` field in JSDoc comments for routes that need different servers:

**Example: Mixed server configuration (auth routes bypass API versioning)**

*serverConfig.json:*
```json
{
  "servers": [
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Main API server"
    }
  ]
}
```

*routes/auth.js (with server override):*
```javascript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     servers:
 *       - url: http://localhost:3000
 *         description: Auth Server (no base path)
 *     summary: User login
 */
```

*routes/users.js (uses default server):*
```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 */
```

**Result:** 
- `routes/users.js` routes → `http://localhost:3000/api/v1/users`
- `routes/auth.js` routes → `http://localhost:3000/auth/login` (no base path)

### Network File Caching

Network files are automatically cached locally in `./confytome-cache/` directory for faster subsequent generations.

## 💡 Examples

### Basic API Documentation

```bash
# Simple API with one route file
confytome all -c api-config.json -f routes/api.js

# Multiple route files
confytome all -c config.json -f routes/users.js routes/auth.js routes/products.js

# Using wildcards (ensure your shell expands them)
confytome all -c config.json -f src/routes/*.js
```

### Multi-Environment Setup

```bash
# Production documentation
confytome all -c prod-config.json -f src/**/*.js

# Staging documentation  
confytome all -c staging-config.json -f src/**/*.js

# Development with local server
confytome all -c dev-config.json -f routes/*.js
```

### Step-by-Step Generation

```bash
# 1. Generate OpenAPI spec first
confytome openapi -c config.json -f routes/users.js routes/products.js

# 2. Generate individual formats (any order)
confytome swagger    # Interactive UI
confytome html       # Styled documentation
confytome markdown   # Confluence-friendly
confytome postman    # API testing collection
```

### CI/CD Integration

```bash
#!/bin/bash
# docs-generate.sh
set -e

echo "📚 Generating API documentation..."

# Install dependencies
npm ci

# Generate all documentation formats
confytome all -c api-config.json -f src/routes/*.js

echo "✅ Documentation generated in docs/"

# Optional: Deploy to documentation site
# rsync -avz docs/ user@docs-server:/var/www/api-docs/
```

## 📁 Generated Output

After running `confytome all`, you'll find these files in `docs/`:

| File | Format | Description | Typical Size |
|------|--------|-------------|-------------|
| `api-spec.json` | OpenAPI 3.0.3 | Machine-readable API specification | ~25KB |
| `API.md` | Markdown | Confluence-friendly with custom templates | ~10KB |
| `api-docs.html` | HTML | Professional styled documentation | ~30KB |
| `swagger-ui-static.html` | HTML | Interactive Swagger UI (self-contained) | ~1.9MB |
| `{API}-v{version}.postman_collection.json` | JSON | Postman collection with requests | ~15KB |
| `postman_env_vars.json` | JSON | Postman environment variables | ~1KB |

### Output Examples

**OpenAPI Spec Features:**
- ✅ OpenAPI 3.0.3 compliant
- ✅ Multiple server environments
- ✅ JWT authentication schemes
- ✅ Comprehensive parameter validation
- ✅ Rich response schemas

**Markdown Features:**
- ✅ Confluence-compatible formatting
- ✅ Quick reference with anchor links
- ✅ Code samples in multiple languages
- ✅ Turkish Unicode character support
- ✅ Clean structure without HTML tags

**HTML Documentation:**
- ✅ Professional responsive design
- ✅ Syntax-highlighted code samples
- ✅ Collapsible sections
- ✅ Print-friendly styles
- ✅ Mobile responsive

## 🔧 Configuration

### Server Configuration (`serverConfig.json`)

Complete configuration example:

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "My API",
    "version": "2.1.0",
    "description": "A comprehensive REST API with authentication",
    "contact": {
      "name": "API Support",
      "email": "api@company.com",
      "url": "https://company.com/support"
    },
    "license": {
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT"
    }
  },
  "servers": [
    {
      "url": "https://api.company.com/v2",
      "description": "Production server"
    },
    {
      "url": "https://staging.company.com/v2",
      "description": "Staging server"
    },
    {
      "url": "http://localhost:3000/api/v2",
      "description": "Local development"
    }
  ],
  "security": [
    { "bearerAuth": [] }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT authentication. Get token from /auth/login"
      }
    },
    "parameters": {
      "PaginationLimit": {
        "name": "limit",
        "in": "query",
        "description": "Number of items per page",
        "schema": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "default": 20
        }
      }
    }
  }
}
```

### Custom Widdershins Templates

The `widdershins-templates/` directory contains customized templates for Markdown generation:

- `main.dot` - Document structure and navigation
- `operation.dot` - Individual endpoint formatting
- `code_shell.dot` - cURL code samples

Modify these templates to customize your Markdown output format.

## 🛠️ Troubleshooting

### Common Issues

#### "Config file not found"
```bash
# Solution: Create config from template
confytome init
# Or manually:
cp serverConfig.template.json serverConfig.json
```

#### "JSDoc files not found"
```bash
# Check file paths are correct
ls -la routes/users.js

# Use absolute paths if needed
confytome openapi -c config.json -f $(pwd)/routes/users.js

# Verify files contain @swagger comments
grep -n "@swagger" routes/users.js
```

#### "OpenAPI spec not found" 
```bash
# Generate OpenAPI spec first
confytome openapi -c config.json -f routes/*.js

# Then run plugins
confytome run generate-swagger generate-html
```

#### "Invalid JSON in config file"
```bash
# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('serverConfig.json', 'utf8'))"

# Or use online JSON validator
# Fix syntax errors and try again
```

#### "Widdershins not found"
```bash
# Reinstall widdershins
npm uninstall widdershins
npm install widdershins@4.0.1

# Or globally
npm install -g widdershins
```

#### "Permission denied" errors
```bash
# Fix file permissions
chmod 644 serverConfig.json
chmod 644 routes/*.js

# Fix directory permissions
chmod 755 docs/
```

### Debug Mode

Enable debug output for troubleshooting:

```bash
# Enable debug mode for plugin system
DEBUG=confytome* confytome generate

# Or for individual commands
DEBUG=confytome* confytome openapi -c config.json -f routes/*.js
DEBUG=confytome* confytome run-all
```

### Getting Help

1. **Check command help**: `confytome <command> --help`
2. **List available plugins**: `confytome generators`
3. **Validate plugins**: `confytome validate`
4. **Plugin information**: `confytome info <generator-name>`
5. **Validate your config**: Use a JSON validator
6. **Check JSDoc syntax**: Ensure YAML is valid in comments
7. **File permissions**: Ensure files are readable
8. **Node.js version**: Requires Node.js 18 or higher

## 🏗️ Architecture

### Design Principles

- **Plugin-First**: Extensible generator registry with automatic discovery
- **OpenAPI-First**: All generators consume OpenAPI specification
- **Service Layer**: Dependency injection for shared functionality
- **Template-Based**: Customizable output via templates and services
- **Maintainable**: Clean separation of concerns and error handling
- **Multi-Format**: Single source, multiple outputs

### Project Structure

```
confytome/ (workspace)
├── 📦 package.json                 # Workspace configuration
├── 📦 package-lock.json            # Dependency lockfile
└── 📁 packages/                    # Modular packages
    ├── 🏗️ core/                   # @confytome/core
    │   ├── cli.js                  # CLI entry point
    │   ├── generate-openapi.js     # OpenAPI generation
    │   ├── utils/                  # Shared utilities
    │   └── templates/              # Project templates
    ├── 📝 markdown/                # @confytome/markdown
    │   ├── cli.js
    │   ├── generate-markdown.js
    │   ├── utils/template-manager.js
    │   └── widdershins-templates/  # Custom templates
    ├── 🎨 swagger/                 # @confytome/swagger
    │   ├── cli.js
    │   └── generate-swagger.js
    ├── 🌐 html/                    # @confytome/html
    │   ├── cli.js
    │   └── generate-html.js
    └── 📮 postman/                 # @confytome/postman
        ├── cli.js
        └── generate-postman.js
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/n-ae/confytome
cd confytome

# Install dependencies
npm install

# Run tests (when available)
npm test

# Check security
npm run security:check
```

### Contribution Guidelines

1. **Maintain Backward Compatibility**
   - Keep all generators spec-agnostic
   - Preserve parametric design (no hardcoded paths)
   - Maintain existing CLI interface

2. **Code Quality**
   - Follow ESM module standards
   - Use centralized error handling (`ErrorHandler`)
   - Add input validation via `CliValidator`
   - Write descriptive commit messages

3. **Testing**
   - Test with multiple JSDoc file types
   - Verify all output formats generate correctly
   - Test error scenarios and validation
   - Ensure Turkish/Unicode character support

4. **Documentation**
   - Update README for new features
   - Add JSDoc comments for new functions
   - Update configuration templates if needed

### Adding New Output Formats

1. Create `generate-{format}.js` following the BaseGenerator pattern
2. Add CLI command in `packages/core/cli.js`
3. Update `generate-all.js` to include new format
4. Add npm script in `package.json`
5. Update documentation and examples

### Submitting Changes

```bash
# Create a feature branch
git checkout -b feature/new-output-format

# Make your changes and commit
git add .
git commit -m "feat: add PDF output format generator"

# Push and create pull request
git push origin feature/new-output-format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Swagger/OpenAPI** community for API specification standards
- **Widdershins** for flexible Markdown template engine  
- **Commander.js** for CLI interface
- **Node.js** ecosystem for robust tooling

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/n-ae/confytome/issues)
- 📖 **Documentation**: This README and inline help (`confytome --help`)

---

**Made with ❤️ for developers who value great API documentation**

*Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.*
