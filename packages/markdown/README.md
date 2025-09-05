# @confytome/markdown

Standalone Markdown documentation generator for Confytome. Generates Confluence-friendly documentation from OpenAPI specifications using custom Widdershins templates.

## Installation

```bash
npm install -g @confytome/markdown
```

## Usage

```bash
# Generate markdown docs from confytome.json config
npx @confytome/markdown --config confytome.json

# Specify custom output directory
npx @confytome/markdown --config confytome.json --output ./api-docs

# Use existing OpenAPI spec
npx @confytome/markdown --spec ./docs/api-spec.json --output ./docs
```

## Options

- `--config, -c <path>` - Path to confytome.json config file (default: ./confytome.json)
- `--output, -o <path>` - Output directory for generated files (default: ./docs)  
- `--spec <path>` - Path to existing OpenAPI spec (optional)
- `--version` - Show version number
- `--help` - Show help information

## Requirements

- **confytome**: This package requires the main `confytome` package to generate OpenAPI specs first
- **widdershins**: Used for markdown template processing

## Features

- 📝 Confluence-friendly markdown output
- 🎨 Custom Widdershins templates for clean formatting
- 🔧 Automatic OpenAPI spec generation if needed
- 📊 Code samples and examples included
- 🕐 Timestamped documentation

## Output

Generates `api-docs.md` in the specified output directory with:
- API overview and server information
- All endpoints with request/response examples
- Data models and schemas
- Timestamp and generation info

---

Part of the [Confytome](https://github.com/n-ae/confytome) documentation ecosystem.