# {{PACKAGE_NAME}}

{{DESCRIPTION}}

## ✨ Features

{{FEATURES_LIST}}

## 📦 Installation

```bash
# Global installation
npm install -g {{PACKAGE_NAME}}

# Or use with npx (no installation)
npx {{PACKAGE_NAME}} --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx {{PACKAGE_NAME}} --spec ./path/to/your-api-spec.json --output ./docs
```

### With confytome.json Configuration
```bash
# Generate from API code - Requires @confytome/core
npx {{PACKAGE_NAME}} --config ./confytome.json --output ./api-docs
```

## ⚙️ Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Path to confytome.json config file | `./confytome.json` |
| `--output` | `-o` | Output directory for generated files | `./docs` |
| `--spec` | | Path to existing OpenAPI spec file | |
| `--version` | `-V` | Show version number | |
| `--help` | `-h` | Show help information | |

{{ADDITIONAL_OPTIONS}}

## 🎯 Two Usage Scenarios

### ✅ Scenario 1: Standalone with Existing Spec
**Perfect when you already have an OpenAPI specification file.**

```bash
npx {{PACKAGE_NAME}} --spec ./my-api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**

### ⚙️ Scenario 2: Generate from Code
**When you need to generate the OpenAPI spec from your API code first.**

```bash
npx {{PACKAGE_NAME}} --config ./confytome.json
```

- ⚠️ **Requires @confytome/core** for spec generation
- ✅ **Full workflow from code to documentation**
- ✅ **Automatic spec generation**

If @confytome/core is not installed, you'll see helpful guidance:
```
💡 You have two options:
   1. Install @confytome/core: npm install -g @confytome/core
   2. Provide existing OpenAPI spec: npx {{PACKAGE_NAME}} --spec path/to/spec.json
```

## 📁 Generated Output

{{OUTPUT_DESCRIPTION}}

{{OUTPUT_EXAMPLES}}

## 🔧 Dependencies

{{DEPENDENCIES_INFO}}

## 💡 Examples

### Basic Usage
```bash
# Simple generation with existing spec
npx {{PACKAGE_NAME}} --spec ./docs/api-spec.json --output ./public
```

### CI/CD Integration
```bash
#!/bin/bash
# Generate {{PACKAGE_TYPE}} documentation in CI
npx {{PACKAGE_NAME}} --spec ./build/api-spec.json --output ./dist/docs
```

### Multiple Environments
```bash
# Production docs
npx {{PACKAGE_NAME}} --spec ./specs/prod-api.json --output ./docs/prod

# Staging docs  
npx {{PACKAGE_NAME}} --spec ./specs/staging-api.json --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### "Specified OpenAPI spec file not found"
```bash
# Check file path exists
ls -la ./path/to/your-spec.json

# Use absolute path if needed
npx {{PACKAGE_NAME}} --spec $(pwd)/api-spec.json
```

#### "OpenAPI spec not found, generating it first"
This means you're using config mode but don't have @confytome/core installed.

```bash
# Option 1: Install core
npm install -g @confytome/core

# Option 2: Use existing spec instead  
npx {{PACKAGE_NAME}} --spec ./path/to/existing-spec.json
```

{{ADDITIONAL_TROUBLESHOOTING}}

## 🌟 Part of confytome Ecosystem

{{PACKAGE_NAME}} is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs  
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful {{PACKAGE_TYPE}} documentation from OpenAPI specifications in seconds.**