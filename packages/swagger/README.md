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
npx @confytome/swagger --help
```

## 🚀 Usage

### Standalone Usage (Recommended)

```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/swagger --spec ./path/to/your-api-spec.json --output ./docs
```

### With confytome.json Configuration

```bash
# Generate from API code - Requires @confytome/core
npx @confytome/swagger --config ./confytome.json --output ./api-docs
```

## ⚙️ Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Path to confytome.json config file | `./confytome.json` |
| `--output` | `-o` | Output directory for generated files | `./docs` |
| `--spec` | | Path to existing OpenAPI spec file | |
| `--version` | `-V` | Show version number | |
| `--help` | `-h` | Show help information | |

| `--no-brand` | | Exclude confytome branding from documentation | |

## 🎯 Two Usage Scenarios

### ✅ Scenario 1: Standalone with Existing Spec

**Perfect when you already have an OpenAPI specification file.**

```bash
npx @confytome/swagger --spec ./my-api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**

### ⚙️ Scenario 2: Generate from Code

**When you need to generate the OpenAPI spec from your API code first.**

```bash
npx @confytome/swagger --config ./confytome.json
```

- ⚠️ **Requires @confytome/core** for spec generation
- ✅ **Full workflow from code to documentation**
- ✅ **Automatic spec generation**

If @confytome/core is not installed, you'll see helpful guidance:
```
💡 You have two options:
   1. Install @confytome/core: npm install -g @confytome/core
   2. Provide existing OpenAPI spec: npx @confytome/swagger --spec path/to/spec.json
```

## 📁 Generated Output

Creates `api-swagger.html` in the specified output directory - a self-contained interactive Swagger UI interface with:

- Complete OpenAPI specification embedded
- Professional Swagger UI styling and responsive layout
- Interactive interface for exploring endpoints
- Deep linking support for easy navigation
- Try-it-out interface (disabled for static documentation)

### Generated File Structure

```
docs/
├── api-swagger.html   # Self-contained Swagger UI (~1.9MB)
└── api-spec.json      # OpenAPI spec (copied from source)
```

### Interface Features

- **Endpoint Explorer** - Expandable sections for each API endpoint
- **Schema Browser** - Interactive data model exploration
- **Response Examples** - Sample responses for each endpoint
- **Parameter Documentation** - Detailed input requirements
- **Authentication Info** - Security scheme documentation

## 🔧 Dependencies

- **commander**: CLI argument parsing
- **swagger-ui-dist**: Official Swagger UI distribution

When using `--spec` option: **No additional dependencies required**
When using `--config` option: **Requires @confytome/core** for OpenAPI spec generation

## 💡 Examples

### Basic Usage

```bash
# Simple generation with existing spec
npx @confytome/swagger --spec ./docs/api-spec.json --output ./public
```

### CI/CD Integration

```bash
#!/bin/bash
# Generate Swagger UI documentation in CI
npx @confytome/swagger --spec ./build/api-spec.json --output ./dist/docs
```

### Multiple Environments

```bash
# Production docs
npx @confytome/swagger --spec ./specs/prod-api.json --output ./docs/prod

# Staging docs  
npx @confytome/swagger --spec ./specs/staging-api.json --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### "Specified OpenAPI spec file not found"

```bash
# Check file path exists
ls -la ./path/to/your-spec.json

# Use absolute path if needed
npx @confytome/swagger --spec $(pwd)/api-spec.json
```

#### "OpenAPI spec not found, generating it first"

This means you're using config mode but don't have @confytome/core installed.

```bash
# Option 1: Install core
npm install -g @confytome/core

# Option 2: Use existing spec instead  
npx @confytome/swagger --spec ./path/to/existing-spec.json
```

#### Large file size (~1.9MB)

The generated HTML file includes the complete Swagger UI bundle for offline usage. This is intentional for self-contained documentation.

## 🌟 Part of confytome Ecosystem

@confytome/swagger is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs  
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful Swagger UI documentation from OpenAPI specifications in seconds.**
