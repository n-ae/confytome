# @confytome/html

Professional styled HTML documentation generator for confytome. Generates clean, responsive HTML documentation from OpenAPI specifications with modern styling and navigation.

## ✨ Features

- 🎨 **Professional Styling** - Clean, modern design with responsive layout\n- 📱 **Mobile-First Design** - Works perfectly on desktop, tablet, and mobile\n- 🏷️ **Organized by Tags** - Groups endpoints by API sections for easy navigation\n- 🎯 **Method Color Coding** - Visual distinction for GET, POST, PUT, DELETE operations\n- 📄 **Self-contained** - Single HTML file with embedded CSS and no external dependencies\n- 🌍 **Unicode Support** - Full international character support\n- 🖨️ **Print-friendly** - Optimized for both screen and print media

## 📦 Installation

```bash
# Global installation
npm install -g @confytome/html

# Or use with npx (no installation)
npx @confytome/html --help
```

## 🚀 Usage

### Standalone Usage (Recommended)
```bash
# Use existing OpenAPI spec - No additional dependencies required
npx @confytome/html --spec ./path/to/your-api-spec.json --output ./docs
```

### With confytome.json Configuration
```bash
# Generate from API code - Requires @confytome/core
npx @confytome/html --config ./confytome.json --output ./api-docs
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
npx @confytome/html --spec ./my-api-spec.json
```

- ✅ **No additional dependencies**
- ✅ **Works immediately**
- ✅ **Perfect for CI/CD pipelines**

### ⚙️ Scenario 2: Generate from Code
**When you need to generate the OpenAPI spec from your API code first.**

```bash
npx @confytome/html --config ./confytome.json
```

- ⚠️ **Requires @confytome/core** for spec generation
- ✅ **Full workflow from code to documentation**
- ✅ **Automatic spec generation**

If @confytome/core is not installed, you'll see helpful guidance:
```
💡 You have two options:
   1. Install @confytome/core: npm install -g @confytome/core
   2. Provide existing OpenAPI spec: npx @confytome/html --spec path/to/spec.json
```

## 📁 Generated Output

Creates `api-docs.html` in the specified output directory - a professional HTML documentation file with:\n- API information panel with version and contact details\n- Server configuration display\n- Organized endpoint documentation grouped by tags\n- Parameter details with types and validation\n- Response code documentation\n- Print-friendly styling

### Generated File Structure\n\n```\ndocs/\n├── api-docs.html      # Professional HTML documentation (~12KB)\n└── api-spec.json      # OpenAPI spec (copied from source)\n```\n\n### Visual Features\n- **Color-coded HTTP methods** (GET=green, POST=blue, PUT=yellow, DELETE=red)\n- **Collapsible sections** for better organization\n- **Syntax highlighting** for code elements\n- **Responsive navigation** for large APIs\n- **Information panels** for API metadata

## 🔧 Dependencies

- **commander**: CLI argument parsing\n\nWhen using `--spec` option: **No additional dependencies required**\nWhen using `--config` option: **Requires @confytome/core** for OpenAPI spec generation

## 💡 Examples

### Basic Usage
```bash
# Simple generation with existing spec
npx @confytome/html --spec ./docs/api-spec.json --output ./public
```

### CI/CD Integration
```bash
#!/bin/bash
# Generate HTML documentation in CI
npx @confytome/html --spec ./build/api-spec.json --output ./dist/docs
```

### Multiple Environments
```bash
# Production docs
npx @confytome/html --spec ./specs/prod-api.json --output ./docs/prod

# Staging docs  
npx @confytome/html --spec ./specs/staging-api.json --output ./docs/staging
```

## 🛠️ Troubleshooting

### Common Issues

#### "Specified OpenAPI spec file not found"
```bash
# Check file path exists
ls -la ./path/to/your-spec.json

# Use absolute path if needed
npx @confytome/html --spec $(pwd)/api-spec.json
```

#### "OpenAPI spec not found, generating it first"
This means you're using config mode but don't have @confytome/core installed.

```bash
# Option 1: Install core
npm install -g @confytome/core

# Option 2: Use existing spec instead  
npx @confytome/html --spec ./path/to/existing-spec.json
```



## 🌟 Part of confytome Ecosystem

@confytome/html is part of the [confytome](https://github.com/n-ae/confytome) documentation ecosystem:

- **[@confytome/core](https://npmjs.com/package/@confytome/core)** - Plugin system & OpenAPI generator
- **[@confytome/markdown](https://npmjs.com/package/@confytome/markdown)** - Confluence-friendly Markdown docs
- **[@confytome/html](https://npmjs.com/package/@confytome/html)** - Professional HTML docs  
- **[@confytome/swagger](https://npmjs.com/package/@confytome/swagger)** - Interactive Swagger UI
- **[@confytome/postman](https://npmjs.com/package/@confytome/postman)** - Postman collections

## 📄 License

MIT License - see the [LICENSE](https://github.com/n-ae/confytome/blob/main/LICENSE) file for details.

---

**Generate beautiful HTML documentation from OpenAPI specifications in seconds.**