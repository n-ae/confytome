# @confytome/html

Professional styled HTML documentation generator for confytome - generates clean, responsive HTML documentation from OpenAPI specifications.

## Installation

```bash
npm install -g @confytome/html
```

## Usage

```bash
# Generate HTML docs from confytome.json config
npx @confytome/html --config confytome.json

# Specify custom output directory
npx @confytome/html --config confytome.json --output ./api-docs

# Use existing OpenAPI spec
npx @confytome/html --spec ./docs/api-spec.json --output ./docs
```

## Options

- `--config, -c <path>` - Path to confytome.json config file (default: ./confytome.json)
- `--output, -o <path>` - Output directory for generated files (default: ./docs)
- `--spec <path>` - Path to existing OpenAPI spec file

## Features

- 🎨 **Professional Styling** - Clean, modern design with Bootstrap-inspired CSS
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🏷️ **Organized by Tags** - Groups endpoints by API sections for easy navigation
- 🎯 **Method Color Coding** - Visual distinction for GET, POST, PUT, DELETE operations
- 📄 **Self-contained** - Single HTML file with embedded CSS and no external dependencies
- 🌍 **Multi-language Support** - Full Unicode support for international content

## Dependencies

- **@confytome/core**: This package requires the main `@confytome/core` package to generate OpenAPI specs first

## Generated Output

Creates `api-docs.html` - a professional HTML documentation file with:
- API information panel with version and contact details
- Server configuration display
- Organized endpoint documentation grouped by tags
- Parameter details with types and validation
- Response code documentation
- Print-friendly styling

## Styling Features

- Color-coded HTTP methods (GET=green, POST=blue, PUT=yellow, DELETE=red)
- Responsive layout that works on all screen sizes
- Professional typography and spacing
- Syntax highlighting for code elements
- Information panels for API metadata
- Clean parameter and response documentation

## Part of Confytome Ecosystem

Part of the [Confytome](https://github.com/n-ae/confytome) documentation ecosystem.

- **@confytome/core** - OpenAPI spec generator
- **@confytome/markdown** - Confluence-friendly Markdown docs
- **@confytome/swagger** - Interactive Swagger UI
- **@confytome/html** - Professional HTML docs (this package)
- **@confytome/postman** - Postman collections
