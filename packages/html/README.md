# @confytome/html

[![npm version](https://badge.fury.io/js/%40confytome%2Fhtml.svg)](https://badge.fury.io/js/@confytome/html)
[![version](https://img.shields.io/badge/version-v2.1.3-blue)](https://www.npmjs.com/package/@confytome/html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

Professional styled HTML documentation generator for confytome. Generates clean, responsive HTML documentation from OpenAPI specifications with modern styling and navigation.

## ✨ Features

- 🎨 **Professional Styling** - Clean, modern design with responsive layout
- 📱 **Mobile-First Design** - Works perfectly on desktop, tablet, and mobile
- 🏷️ **Organized by Tags** - Groups endpoints by API sections for easy navigation
- 🎯 **Method Color Coding** - Visual distinction for GET, POST, PUT, DELETE operations
- 📄 **Self-contained** - Single HTML file with embedded CSS and no external dependencies
- 🌍 **Unicode Support** - Full international character support
- 🖨️ **Print-friendly** - Optimized for both screen and print media

## 📦 Installation

```bash
# Global installation
npm install -g @confytome/html

# Or use with npx (no installation)
npx @confytome/html generate --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/html generate --spec ./confytome/api-spec.json --output ./confytome
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
npx @confytome/html generate --spec ./confytome/api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**


## 📁 Generated Output

Creates `api-docs.html` in the specified output directory - a professional HTML documentation file with:
- API information panel with version and contact details
- Server configuration display
- Organized endpoint documentation grouped by tags
- Parameter details with types and validation
- Response code documentation
- Print-friendly styling

### Generated File Structure

```
confytome/
├── api-docs.html
├── api-spec.json
```

### Content Features
- **Color-coded HTTP methods** (GET=green, POST=blue, PUT=yellow, DELETE=red)
- **Collapsible sections** for better organization
- **Syntax highlighting** for code elements
- **Responsive navigation** for large APIs
- **Information panels** for API metadata


## 🔧 Dependencies

- **commander**: CLI argument parsing

## 💡 Examples

### Basic Usage

```bash
# Simple generation with existing spec
npx @confytome/html generate --spec ./confytome/api-spec.json
```

### CI/CD Integration

```bash
#!/bin/bash
# Generate HTML documentation in CI
npx @confytome/html generate \
   --spec ./confytome/api-spec.json \
   --output ./confytome
```

### Multiple Environments

```bash
# Production docs
npx @confytome/html generate \
   --spec ./specs/prod-api.json \
   --output ./docs/prod

# Staging docs
npx @confytome/html generate \
   --spec ./specs/staging-api.json \
   --output ./docs/staging
```


#### "Specified OpenAPI spec file not found"

```bash
# Check file path exists
ls -la ./confytome/api-spec.json

# Use absolute path if needed
npx @confytome/html generate --spec $(pwd)/confytome/api-spec.json
```


## 🌟 Part of confytome Ecosystem

@confytome/html is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/confluence](https://npmjs.com/package/@confytome/confluence)** - Confluence-ready Markdown with clipboard
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful HTML documentation from OpenAPI specifications in seconds.**
