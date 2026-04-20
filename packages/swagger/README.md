# @confytome/swagger

Interactive Swagger UI generator for confytome. Generates self-contained Swagger UI documentation from OpenAPI specifications with responsive design and embedded assets.

## ✨ Features

- 🎨 **Interactive Swagger UI** - Full-featured API explorer interface
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎯 **Self-contained** - Single HTML file with all assets embedded (~1.9MB)
- 🔒 **Documentation Mode** - Displays spec without making actual API calls
- 🌍 **Unicode Support** - Supports international characters and languages
- 🔗 **Deep Linking** - Direct links to specific endpoints
- ⚡ **Fast Loading** - Optimized bundle with minimal dependencies

## 📦 Installation

```bash
# Global installation
npm install -g @confytome/swagger

# Or use with npx (no installation)
npx @confytome/swagger generate --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/swagger generate --spec ./confytome/api-spec.json --output ./confytome
```


## ⚙️ Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--spec` | `-s` | Path to OpenAPI spec file | `./confytome/api-spec.json` |
| `--output` | `-o` | Output directory for generated files | `./confytome` |
| `--version` | `-V` | Show version number |  |
| `--help` | `-h` | Show help information |  |
| `--no-brand` |  | Exclude confytome branding from documentation |  |

## 🎯 Usage Scenarios

### ✅ Scenario 1: Standalone with Existing Spec
**Perfect when you already have an OpenAPI specification file.**

```bash
npx @confytome/swagger generate --spec ./confytome/api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**


## 📁 Generated Output

Creates `api-swagger.html` in the specified output directory - a self-contained interactive Swagger UI interface with:
- Complete OpenAPI specification embedded
- Professional Swagger UI styling and responsive layout
- Interactive interface for exploring endpoints
- Deep linking support for easy navigation
- Try-it-out interface (disabled for static documentation)

### Generated File Structure

```
confytome/
├── api-swagger.html
├── api-spec.json
```

### Content Features
- **Endpoint Explorer** - Expandable sections for each API endpoint
- **Schema Browser** - Interactive data model exploration
- **Response Examples** - Sample responses for each endpoint
- **Parameter Documentation** - Detailed input requirements
- **Authentication Info** - Security scheme documentation


## 🔧 Dependencies

- **commander**: CLI argument parsing
- **swagger-ui-dist**: Official Swagger UI distribution

## 💡 Examples

### Basic Usage

```bash
# Simple generation with existing spec
npx @confytome/swagger generate --spec ./confytome/api-spec.json
```

### CI/CD Integration

```bash
#!/bin/bash
# Generate Swagger UI documentation in CI
npx @confytome/swagger generate \
   --spec ./confytome/api-spec.json \
   --output ./confytome
```

### Multiple Environments

```bash
# Production docs
npx @confytome/swagger generate \
   --spec ./specs/prod-api.json \
   --output ./docs/prod

# Staging docs
npx @confytome/swagger generate \
   --spec ./specs/staging-api.json \
   --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### Large file size (~1.9MB)
The generated HTML file includes the complete Swagger UI bundle for offline usage. This is intentional for self-contained documentation.


#### "Specified OpenAPI spec file not found"

```bash
# Check file path exists
ls -la ./confytome/api-spec.json

# Use absolute path if needed
npx @confytome/swagger generate --spec $(pwd)/confytome/api-spec.json
```


## 🌟 Part of confytome Ecosystem

@confytome/swagger is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/confluence](https://npmjs.com/package/@confytome/confluence)** - Confluence-ready Markdown with clipboard
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful Swagger UI documentation from OpenAPI specifications in seconds.**
