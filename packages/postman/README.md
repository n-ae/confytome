# @confytome/postman

Postman collection generator for confytome. Generates Postman collections and environment variables from OpenAPI specifications for comprehensive API testing and development workflows.

## ✨ Features

- 📥 **Complete Postman Collections** - Ready-to-import collection with all API endpoints
- 🌍 **Environment Variables** - Pre-configured environment with base URLs and auth tokens
- 🧪 **Built-in Tests** - Automatic status code and response time validation
- 📋 **Request Examples** - Sample request bodies and query parameters
- 🔐 **Authentication Support** - Bearer token and API key authentication setup
- 🎯 **Path Parameters** - Automatic conversion from OpenAPI to Postman format
- 📊 **Collection Organization** - Structured by tags and endpoints

## 📦 Installation

```bash
# Global installation
npm install -g @confytome/postman

# Or use with npx (no installation)
npx @confytome/postman --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/postman --spec ./path/to/your-api-spec.json --output ./docs
```

### With confytome.json Configuration
```bash
# Generate from API code - Requires @confytome/core
npx @confytome/postman --config ./confytome.json --output ./api-docs
```

## ⚙️ Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Path to confytome.json config file | `./confytome.json` |
| `--output` | `-o` | Output directory for generated files | `./docs` |
| `--spec` | | Path to existing OpenAPI spec file | |
| `--version` | `-V` | Show version number | |
| `--help` | `-h` | Show help information | |



## 🎯 Two Usage Scenarios

### ✅ Scenario 1: Standalone with Existing Spec

**Perfect when you already have an OpenAPI specification file.**

```bash
npx @confytome/postman --spec ./my-api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**

### ⚙️ Scenario 2: Generate from Code

**When you need to generate the OpenAPI spec from your API code first.**

```bash
npx @confytome/postman --config ./confytome.json
```

- ⚠️ **Requires @confytome/core** for spec generation
- ✅ **Full workflow from code to documentation**
- ✅ **Automatic spec generation**

If @confytome/core is not installed, you'll see helpful guidance:

```
💡 You have two options:
   1. Install @confytome/core: npm install -g @confytome/core
   2. Provide existing OpenAPI spec: npx @confytome/postman --spec path/to/spec.json
```

## 📁 Generated Output

Creates two files for import into Postman:

### 1. `api-postman.json` - Collection File

- Complete API request collection with proper naming
- Request bodies with realistic example data
- Query parameters with sample values
- Built-in test scripts for validation

### 2. `api-postman-env.json` - Environment File

- `BASE_URL` - API base URL from OpenAPI spec
- `API_VERSION` - API version number
- `AUTH_TOKEN` - Placeholder for authentication token

### Generated File Structure

```
docs/
├── api-postman.json      # Postman collection (~8KB)
├── api-postman-env.json  # Environment variables (~1KB)
└── api-spec.json         # OpenAPI spec (copied from source)
```

### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection

## 🔧 Dependencies

- **commander**: CLI argument parsing

When using `--spec` option: **No additional dependencies required**
When using `--config` option: **Requires @confytome/core** for OpenAPI spec generation

## 💡 Examples

### Basic Usage

```bash
# Simple generation with existing spec
npx @confytome/postman --spec ./docs/api-spec.json --output ./public
```

### CI/CD Integration

```bash
#!/bin/bash
# Generate Postman collection documentation in CI
npx @confytome/postman --spec ./build/api-spec.json --output ./dist/docs
```

### Multiple Environments

```bash
# Production docs
npx @confytome/postman --spec ./specs/prod-api.json --output ./docs/prod

# Staging docs  
npx @confytome/postman --spec ./specs/staging-api.json --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### "Specified OpenAPI spec file not found"

```bash
# Check file path exists
ls -la ./path/to/your-spec.json

# Use absolute path if needed
npx @confytome/postman --spec $(pwd)/api-spec.json
```

#### "OpenAPI spec not found, generating it first"

This means you're using config mode but don't have @confytome/core installed.

```bash
# Option 1: Install core
npm install -g @confytome/core

# Option 2: Use existing spec instead  
npx @confytome/postman --spec ./path/to/existing-spec.json
```

#### "Generated X API requests"

This shows the number of endpoints successfully converted to Postman requests. Each OpenAPI path/method combination becomes a Postman request.

## 🌟 Part of confytome Ecosystem

@confytome/postman is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs  
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful Postman collection documentation from OpenAPI specifications in seconds.**
