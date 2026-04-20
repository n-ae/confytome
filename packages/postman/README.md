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
npx @confytome/postman generate --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/postman generate --spec ./confytome/api-spec.json --output ./confytome
```


## ⚙️ Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--spec` | `-s` | Path to OpenAPI spec file | `./confytome/api-spec.json` |
| `--output` | `-o` | Output directory for generated files | `./confytome` |
| `--version` | `-V` | Show version number |  |
| `--help` | `-h` | Show help information |  |

## 🎯 Usage Scenarios

### ✅ Scenario 1: Standalone with Existing Spec
**Perfect when you already have an OpenAPI specification file.**

```bash
npx @confytome/postman generate --spec ./confytome/api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**


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
confytome/
├── api-postman.json
├── api-postman-env.json
├── api-spec.json
```

### Content Features

### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection
### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection
### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection
### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection
### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection
### How to Use Generated Files

1. **Open Postman**
2. **Import Collection**: File → Import → Select `api-postman.json`
3. **Import Environment**: Settings (gear icon) → Import → Select `api-postman-env.json`
4. **Set Environment**: Select the imported environment from dropdown
5. **Configure Auth**: Edit environment to set your actual `AUTH_TOKEN`
6. **Start Testing**: Run individual requests or entire collection

## 🔧 Dependencies

- **commander**: CLI argument parsing

## 💡 Examples

### Basic Usage

```bash
# Simple generation with existing spec
npx @confytome/postman generate --spec ./confytome/api-spec.json
```

### CI/CD Integration

```bash
#!/bin/bash
# Generate Postman collection documentation in CI
npx @confytome/postman generate \
   --spec ./confytome/api-spec.json \
   --output ./confytome
```

### Multiple Environments

```bash
# Production docs
npx @confytome/postman generate \
   --spec ./specs/prod-api.json \
   --output ./docs/prod

# Staging docs
npx @confytome/postman generate \
   --spec ./specs/staging-api.json \
   --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### "Generated X API requests"
This shows the number of endpoints successfully converted to Postman requests. Each OpenAPI path/method combination becomes a Postman request.


#### "Specified OpenAPI spec file not found"

```bash
# Check file path exists
ls -la ./confytome/api-spec.json

# Use absolute path if needed
npx @confytome/postman generate --spec $(pwd)/confytome/api-spec.json
```


## 🌟 Part of confytome Ecosystem

@confytome/postman is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/confluence](https://npmjs.com/package/@confytome/confluence)** - Confluence-ready Markdown with clipboard
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful Postman collection documentation from OpenAPI specifications in seconds.**
