# @confytome/swagger

Interactive Swagger UI generator for Confytome - generates self-contained Swagger UI documentation from OpenAPI specifications.

## Installation

```bash
npm install -g @confytome/swagger
```

## Usage

```bash
# Generate Swagger UI docs from confytome.json config
npx @confytome/swagger --config confytome.json

# Specify custom output directory
npx @confytome/swagger --config confytome.json --output ./api-docs

# Use existing OpenAPI spec
npx @confytome/swagger --spec ./docs/api-spec.json --output ./docs
```

## Options

- `--config, -c <path>` - Path to confytome.json config file (default: ./confytome.json)
- `--output, -o <path>` - Output directory for generated files (default: ./docs)
- `--spec <path>` - Path to existing OpenAPI spec file

## Features

- 🎨 **Interactive Swagger UI** - Full-featured API explorer interface
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎯 **Self-contained** - Single HTML file with embedded assets
- 🔒 **Static Mode** - Displays documentation without actual API calls
- 🌍 **Multi-language Support** - Supports Unicode and special characters

## Dependencies

- **@confytome/core**: This package requires the main `@confytome/core` package to generate OpenAPI specs first

## Generated Output

Creates `api-swagger.html` - a self-contained interactive Swagger UI interface with:
- Complete OpenAPI specification embedded
- Professional styling and responsive layout
- Try-it-out interface (disabled for static documentation)
- Deep linking support for easy navigation

## Part of Confytome Ecosystem

Part of the [Confytome](https://github.com/n-ae/confytome) documentation ecosystem.

- **@confytome/core** - OpenAPI spec generator
- **@confytome/markdown** - Confluence-friendly Markdown docs
- **@confytome/swagger** - Interactive Swagger UI (this package)
- **@confytome/postman** - Postman collections (coming soon)
- **@confytome/html** - Professional HTML docs (coming soon)