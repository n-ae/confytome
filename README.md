# 🍃 Confytome

[![npm version](https://badge.fury.io/js/confytome.svg)](https://badge.fury.io/js/confytome)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Code Style: ESM](https://img.shields.io/badge/code%20style-ESM-blue)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

> A modern CLI tool to generate comprehensive API documentation from JSDoc comments. Create OpenAPI specs, Markdown docs, Swagger UI, HTML, and Postman collections from a single source with custom templates and multilingual support.

## ✨ Features

- 🚀 **Generate 6 documentation formats** from JSDoc comments
- 📝 **OpenAPI 3.0.3 specification** generation with validation
- 🎨 **Beautiful HTML documentation** with professional styling  
- 📖 **Clean Markdown** with custom Widdershins templates
- 🔍 **Interactive Swagger UI** as static HTML
- 📮 **Postman collections** with environment variables
- 🌍 **Multilingual support** (Turkish, English, Unicode characters)
- 🔧 **Fully parametric** - works with any config and JSDoc files
- ⚡ **CLI interface** with comprehensive validation and error handling
- 🏗️ **Maintainable architecture** with centralized utilities

## 📦 Installation

### Global Installation (Recommended)

```bash
# Install globally for CLI access
npm install -g confytome

# Verify installation
confytome --version
```

### NPX Usage (No Installation Required)

```bash
# Use without installing
npx confytome --help
npx confytome init
```

### Local Development

```bash
# Clone and install
git clone https://github.com/n-ae/portfolio
cd portfolio/confytome
npm install

# Use locally
./bin.js --help
```

## 🚀 Quick Start

### Option 1: Simple Approach (Recommended) 🌟

#### 1. Initialize Your Project

```bash
# Create project structure and config templates
confytome init

# This creates:
# - docs/ directory
# - confytome.json (simplified config)
# - serverConfig.json (detailed OpenAPI config)
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

#### 3. Generate All Documentation

```bash
# Generate all documentation formats at once
confytome generate

# Or with custom config
confytome generate --config my-confytome.json --output ./api-docs
```

### Option 2: Advanced Approach

#### 1. Configure Your API

Edit the generated `serverConfig.json`:

```json
{
  \"info\": {
    \"title\": \"My Awesome API\",
    \"version\": \"1.0.0\",
    \"description\": \"A comprehensive API for my application\"
  },
  \"servers\": [
    {
      \"url\": \"https://api.example.com/v1\",
      \"description\": \"Production server\"
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
```

### 4. Generate Documentation

```bash
# Generate all documentation formats
confytome all -c serverConfig.json -f routes/users.js routes/auth.js

# Or step by step
confytome openapi -c serverConfig.json -f routes/*.js
confytome swagger
confytome html
confytome markdown
confytome postman
```

## 📚 Command Reference

### Global Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `init` | Initialize project structure | `confytome init` |
| `generate` | 🌟 Generate docs using confytome.json | `confytome generate` |
| `openapi` | Generate OpenAPI specification | `confytome openapi -c config.json -f file1.js file2.js` |
| `all` | Generate all documentation formats | `confytome all -c config.json -f file1.js file2.js` |

### Individual Format Commands

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

echo \"📚 Generating API documentation...\"

# Install dependencies
npm ci

# Generate all documentation formats
confytome all -c api-config.json -f src/routes/*.js

echo \"✅ Documentation generated in docs/\"

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
  \"openapi\": \"3.0.3\",
  \"info\": {
    \"title\": \"My API\",
    \"version\": \"2.1.0\",
    \"description\": \"A comprehensive REST API with authentication\",
    \"contact\": {
      \"name\": \"API Support\",
      \"email\": \"api@company.com\",
      \"url\": \"https://company.com/support\"
    },
    \"license\": {
      \"name\": \"MIT\",
      \"url\": \"https://opensource.org/licenses/MIT\"
    }
  },
  \"servers\": [
    {
      \"url\": \"https://api.company.com/v2\",
      \"description\": \"Production server\"
    },
    {
      \"url\": \"https://staging.company.com/v2\",
      \"description\": \"Staging server\"
    },
    {
      \"url\": \"http://localhost:3000/api/v2\",
      \"description\": \"Local development\"
    }
  ],
  \"security\": [
    { \"bearerAuth\": [] }
  ],
  \"components\": {
    \"securitySchemes\": {
      \"bearerAuth\": {
        \"type\": \"http\",
        \"scheme\": \"bearer\",
        \"bearerFormat\": \"JWT\",
        \"description\": \"JWT authentication. Get token from /auth/login\"
      }
    },
    \"parameters\": {
      \"PaginationLimit\": {
        \"name\": \"limit\",
        \"in\": \"query\",
        \"description\": \"Number of items per page\",
        \"schema\": {
          \"type\": \"integer\",
          \"minimum\": 1,
          \"maximum\": 100,
          \"default\": 20
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

#### \"Config file not found\"
```bash
# Solution: Create config from template
confytome init
# Or manually:
cp serverConfig.template.json serverConfig.json
```

#### \"JSDoc files not found\"
```bash
# Check file paths are correct
ls -la routes/users.js

# Use absolute paths if needed
confytome openapi -c config.json -f $(pwd)/routes/users.js

# Verify files contain @swagger comments
grep -n \"@swagger\" routes/users.js
```

#### \"OpenAPI spec not found\"
```bash
# Generate OpenAPI spec first
confytome openapi -c config.json -f routes/*.js

# Then run other commands
confytome swagger
```

#### \"Invalid JSON in config file\"
```bash
# Validate JSON syntax
node -e \"JSON.parse(require('fs').readFileSync('serverConfig.json', 'utf8'))\"

# Or use online JSON validator
# Fix syntax errors and try again
```

#### \"Widdershins not found\"
```bash
# Reinstall widdershins
npm uninstall widdershins
npm install widdershins@4.0.1

# Or globally
npm install -g widdershins
```

#### \"Permission denied\" errors
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
# Enable debug mode
DEBUG=confytome* confytome all -c config.json -f routes/*.js

# Or set environment variable
export DEBUG=confytome*
confytome openapi -c config.json -f routes/*.js
```

### Getting Help

1. **Check command help**: `confytome <command> --help`
2. **Validate your config**: Use a JSON validator
3. **Check JSDoc syntax**: Ensure YAML is valid in comments
4. **File permissions**: Ensure files are readable
5. **Node.js version**: Requires Node.js 18 or higher

## 🏗️ Architecture

### Design Principles

- **OpenAPI-First**: All generators consume OpenAPI specification
- **Parametric**: No hardcoded file references
- **Template-Based**: Customizable output via templates
- **Maintainable**: Centralized utilities and error handling
- **Multi-Format**: Single source, multiple outputs

### Project Structure

```
confytome/
├── 📦 package.json                 # Project config & dependencies
├── 🔧 bin.js                      # CLI entry point
├── ⚙️  serverConfig.template.json  # Configuration template
├── 🏭 Core Generators
│   ├── generate-openapi.js        # OpenAPI spec (first step)
│   ├── generate-markdown.js       # Markdown with widdershins
│   ├── generate-swagger-ui.js     # Interactive Swagger UI
│   ├── generate-simple-docs.js    # Styled HTML
│   ├── generate-postman.js        # Postman collections
│   └── generate-all.js           # Orchestrates all generators
├── 🛠️  Utils
│   ├── base-generator.js          # Common generator patterns
│   ├── cli-validator.js           # Input validation & help
│   ├── error-handler.js           # Centralized error handling
│   └── file-manager.js            # File operations
├── 🎨 widdershins-templates/
│   ├── main.dot                   # Markdown document template
│   └── operation.dot              # Endpoint formatting
└── 📄 docs/                       # Generated documentation
    ├── api-spec.json
    ├── API.md
    ├── api-docs.html
    ├── swagger-ui-static.html
    └── *.postman_collection.json
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/n-ae/portfolio
cd portfolio/confytome

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
2. Add CLI command in `bin.js`
3. Update `generate-all.js` to include new format
4. Add npm script in `package.json`
5. Update documentation and examples

### Submitting Changes

```bash
# Create a feature branch
git checkout -b feature/new-output-format

# Make your changes and commit
git add .
git commit -m \"feat: add PDF output format generator\"

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

- 🐛 **Issues**: [GitHub Issues](https://github.com/n-ae/portfolio/issues)
- 📧 **Email**: balii@pm.me
- 📖 **Documentation**: This README and inline help (`confytome --help`)

---

**Made with ❤️ for developers who value great API documentation**

*Generate beautiful, comprehensive API documentation from your existing JSDoc comments in seconds.*