# @confytome/markdown

[![npm version](https://badge.fury.io/js/%40confytome%2Fmarkdown.svg)](https://badge.fury.io/js/@confytome/markdown)
[![version](https://img.shields.io/badge/version-v2.1.4-blue)](https://www.npmjs.com/package/@confytome/markdown)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

Standalone Markdown documentation generator for confytome. Generates Confluence-friendly documentation from OpenAPI specifications using custom Mustache templates with Turkish Unicode support.

## ✨ Features

- 📝 **Confluence-friendly Markdown** - Clean formatting without HTML tags
- 🎨 **Custom Mustache Templates** - Professional styling with logic-less templates
- 🔧 **Automatic OpenAPI Integration** - Seamless spec consumption
- 📊 **Code Samples & Examples** - cURL requests and response examples
- 🌍 **Unicode Support** - Full Turkish and international character support
- ⚡ **Standalone Operation** - Works with existing OpenAPI specs
- 🕐 **Timestamped Documentation** - Generation metadata included

## 📦 Installation

```bash
# Global installation
npm install -g @confytome/markdown

# Or use with npx (no installation)
npx @confytome/markdown generate --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/markdown generate --spec ./confytome/api-spec.json --output ./confytome
```

### With confytome.json Configuration
```bash
# Generate spec from JSDoc and produce docs in one step - Requires @confytome/core
npx @confytome/markdown generate --config ./confytome.json --output ./confytome
```

## ⚙️ Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--spec` | `-s` | Path to OpenAPI spec file | `./confytome/api-spec.json` |
| `--output` | `-o` | Output directory for generated files | `./confytome` |
| `--version` | `-V` | Show version number |  |
| `--help` | `-h` | Show help information |  |
| `--config` | `-c` | Server config JSON file (for generating spec from JSDoc) |  |
| `--files` | `-f` | JSDoc files to process |  |
| `--no-brand` |  | Exclude confytome branding from documentation |  |
| `--no-url-encode` |  | Disable URL encoding for anchor links |  |

## 🎯 Usage Scenarios

### ✅ Scenario 1: Standalone with Existing Spec
**Perfect when you already have an OpenAPI specification file.**

```bash
npx @confytome/markdown generate --spec ./confytome/api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**

### ⚙️ Scenario 2: Generate from Code
**When you want to generate the OpenAPI spec from your API code first.**

```bash
npx @confytome/markdown generate --config ./confytome.json
```

- ⚠️ **Requires @confytome/core** for spec generation
- ✅ **Full workflow from code to documentation**
- ✅ **Automatic spec generation**

## 📁 Generated Output

Creates `api-docs.md` in the specified output directory with:

- API overview and server information
- All endpoints with request/response examples
- Data models and schemas
- Timestamp and generation info

### Generated File Structure

```
confytome/
├── api-docs.md        # Main markdown documentation
├── api-spec.json      # OpenAPI spec (copied from source)
```

### Content Features
- **Quick Reference** - Table of contents with anchor links
- **Server Information** - Base URLs and environment details
- **Endpoint Documentation** - Complete request/response details
- **Schema Definitions** - Data model documentation
- **Code samples** - Ready-to-use cURL examples


## 🔧 Dependencies

- **commander**: CLI argument parsing
- **mustache**: Markdown template processing engine

## 💡 Examples

### Basic Usage

```bash
# Simple generation with existing spec
npx @confytome/markdown generate --spec ./confytome/api-spec.json
```

### CI/CD Integration

```bash
#!/bin/bash
# Generate Markdown documentation in CI
npx @confytome/markdown generate \
   --spec ./confytome/api-spec.json \
   --output ./confytome
```

### Multiple Environments

```bash
# Production docs
npx @confytome/markdown generate \
   --spec ./specs/prod-api.json \
   --output ./docs/prod

# Staging docs
npx @confytome/markdown generate \
   --spec ./specs/staging-api.json \
   --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### Templates not found
Ensure Mustache templates are in the templates/ directory. Default templates are included with the package.


#### "Specified OpenAPI spec file not found"

```bash
# Check file path exists
ls -la ./confytome/api-spec.json

# Use absolute path if needed
npx @confytome/markdown generate --spec $(pwd)/confytome/api-spec.json
```

#### "No OpenAPI spec found, generating from JSDoc files..."

This is normal when using `--config` — the spec is generated automatically from your JSDoc annotations before docs are produced.

```bash
# Option 1: Use config to generate everything in one step
npx @confytome/markdown generate --config ./confytome.json

# Option 2: Use an existing spec directly
npx @confytome/markdown generate --spec ./confytome/api-spec.json
```

## 🌟 Part of confytome Ecosystem

@confytome/markdown is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/confluence](https://npmjs.com/package/@confytome/confluence)** - Confluence-ready Markdown with clipboard
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful Markdown documentation from OpenAPI specifications in seconds.**
