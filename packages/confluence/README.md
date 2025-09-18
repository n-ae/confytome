# @confytome/confluence

Cross-platform Markdown to Confluence converter with clipboard integration. This is a JavaScript replacement for the PowerShell-based `md2confluence.ps1` script.

## Features

- 🔄 **Cross-platform** - Works on Windows, macOS, and Linux
- 📋 **Clipboard Integration** - Automatically copies converted content to clipboard
- 🎨 **Confluence Formatting** - Produces HTML compatible with Confluence editors
- 📝 **Markdown Support** - Full GitHub Flavored Markdown support
- 🚀 **Standalone** - Can work independently or with @confytome/markdown
- 🌍 **Unicode Support** - Full UTF-8 support for international characters

## Installation

```bash
npm install @confytome/confluence
```

## Usage

### Convert a Markdown file

```bash
# Convert markdown file to Confluence format and copy to clipboard
npx confytome-confluence convert path/to/your/file.md

# Convert without copying to clipboard
npx confytome-confluence convert path/to/your/file.md --no-clipboard

# Specify output directory
npx confytome-confluence convert file.md -o ./output
```

### Generate from OpenAPI spec

```bash
# Generate from existing OpenAPI spec
npx confytome-confluence generate -s api-spec.json

# Generate from JSDoc files
npx confytome-confluence generate -c serverConfig.json -f routes/*.js
```

### Validate a Markdown file

```bash
npx confytome-confluence validate file.md
```

## How It Works

1. **Reads** your Markdown file with UTF-8 encoding
2. **Converts** Markdown to Confluence-compatible HTML using the `marked` library
3. **Formats** the HTML with proper Confluence classes and structure
4. **Creates** clipboard-ready HTML with proper headers (like the PowerShell version)
5. **Copies** to clipboard for direct pasting into Confluence

## Dependency Chain

This package follows the Confytome dependency pattern:

```
@confytome/core → @confytome/markdown → @confytome/confluence
```

- **@confytome/confluence** depends on **@confytome/markdown** for OpenAPI → Markdown conversion
- **@confytome/markdown** depends on **@confytome/core** for OpenAPI spec generation

## CLI Commands

### `convert <path>`

Convert a Markdown file to Confluence format.

**Arguments:**
- `path` - Path to the Markdown file (.md)

**Options:**
- `-o, --output <dir>` - Output directory (default: ./confytome)
- `--no-clipboard` - Skip copying to clipboard
- `--no-brand` - Exclude confytome branding

### `generate`

Generate Confluence documentation from OpenAPI specs.

**Options:**
- `-s, --spec <path>` - Path to OpenAPI spec file (default: ./api-spec.json)
- `-c, --config <path>` - Server config JSON file
- `-f, --files <files...>` - JSDoc files to process
- `-o, --output <path>` - Output directory (default: ./confytome)
- `--no-clipboard` - Skip copying to clipboard
- `--no-brand` - Exclude confytome branding

### `validate <path>`

Validate a Markdown file for Confluence conversion.

**Arguments:**
- `path` - Path to the Markdown file to validate

## Usage in Confluence

1. Run the converter: `npx confytome-confluence convert your-file.md`
2. Open your Confluence page editor
3. Paste the content (Ctrl+V / Cmd+V)
4. The content will paste with proper formatting
5. For code blocks: Select pasted code → Insert → Code Block
6. For headers: Select text → Apply header style from toolbar

## Comparison with PowerShell Version

| Feature | PowerShell (md2confluence.ps1) | JavaScript (@confytome/confluence) |
|---------|-------------------------------|-----------------------------------|
| **Platform** | Windows only | Cross-platform (Windows, macOS, Linux) |
| **Dependencies** | Pandoc, PowerShell, .NET | Node.js only |
| **Clipboard** | Windows HTML Format | Universal clipboard with HTML fallback |
| **Markdown Parser** | Pandoc | Marked (JavaScript) |
| **Unicode Support** | Full UTF-8 | Full UTF-8 |
| **Installation** | Manual script | npm package |
| **Integration** | Standalone | Part of Confytome ecosystem |

## API

You can also use the generator programmatically:

```javascript
import { StandaloneConfluenceGenerator } from '@confytome/confluence';

const generator = new StandaloneConfluenceGenerator('./output', {
  markdownPath: './my-docs.md'
});

await generator.initialize();
const result = await generator.convertMarkdownFile('./my-docs.md');

if (result.success) {
  console.log('Conversion successful!', result.outputPath);
}
```

## License

MIT

## Related Packages

- [@confytome/core](../core) - Core OpenAPI generator
- [@confytome/markdown](../markdown) - Markdown documentation generator
- [@confytome/html](../html) - HTML documentation generator
- [@confytome/swagger](../swagger) - Swagger UI generator