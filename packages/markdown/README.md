# @confytome/markdown

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
npx @confytome/markdown --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/markdown --spec ./path/to/your-api-spec.json --output ./docs
```

### With confytome.json Configuration
```bash
# Generate from API code - Requires @confytome/core
npx @confytome/markdown --config ./confytome.json --output ./api-docs
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
npx @confytome/markdown --spec ./my-api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**

### ⚙️ Scenario 2: Generate from Code
**When you need to generate the OpenAPI spec from your API code first.**

```bash
npx @confytome/markdown --config ./confytome.json
```

- ⚠️ **Requires @confytome/core** for spec generation
- ✅ **Full workflow from code to documentation**
- ✅ **Automatic spec generation**

If @confytome/core is not installed, you'll see helpful guidance:
```
💡 You have two options:
   1. Install @confytome/core: npm install -g @confytome/core
   2. Provide existing OpenAPI spec: npx @confytome/markdown --spec path/to/spec.json
```

## 📁 Generated Output

Creates `api-docs.md` in the specified output directory with:\n- API overview and server information\n- All endpoints with request/response examples\n- Data models and schemas\n- Timestamp and generation info

### Generated File Structure\n\n```\ndocs/\n├── api-docs.md        # Main markdown documentation\n└── api-spec.json      # OpenAPI spec (copied from source)\n```\n\n### Content Features\n- **Quick Reference** - Table of contents with anchor links\n- **Server Information** - Base URLs and environment details\n- **Endpoint Documentation** - Complete request/response details\n- **Schema Definitions** - Data model documentation\n- **Code samples** - Ready-to-use cURL examples

## 🔧 Dependencies

- **commander**: CLI argument parsing\n- **mustache**: Markdown template processing engine\n\nWhen using `--spec` option: **No additional dependencies required**\nWhen using `--config` option: **Requires @confytome/core** for OpenAPI spec generation

## 💡 Examples

### Basic Usage
```bash
# Simple generation with existing spec
npx @confytome/markdown --spec ./docs/api-spec.json --output ./public
```

### CI/CD Integration
```bash
#!/bin/bash
# Generate Markdown documentation in CI
npx @confytome/markdown --spec ./build/api-spec.json --output ./dist/docs
```

### Multiple Environments
```bash
# Production docs
npx @confytome/markdown --spec ./specs/prod-api.json --output ./docs/prod

# Staging docs  
npx @confytome/markdown --spec ./specs/staging-api.json --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### "Specified OpenAPI spec file not found"
```bash
# Check file path exists
ls -la ./path/to/your-spec.json

# Use absolute path if needed
npx @confytome/markdown --spec $(pwd)/api-spec.json
```

#### "OpenAPI spec not found, generating it first"
This means you're using config mode but don't have @confytome/core installed.

```bash
# Option 1: Install core
npm install -g @confytome/core

# Option 2: Use existing spec instead  
npx @confytome/markdown --spec ./path/to/existing-spec.json
```

#### Templates not found\nEnsure Mustache templates are in the templates/ directory. Default templates are included with the package.

## 🌟 Part of confytome Ecosystem

@confytome/markdown is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs  
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful Markdown documentation from OpenAPI specifications in seconds.**