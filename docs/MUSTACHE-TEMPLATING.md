# Mustache Templating System

The confytome project uses Mustache templates to eliminate code repetition and maintain consistency across generator packages. This document describes the templating system for CLI files and plugin manifests.

## Overview

The templating system provides **inversion of control** for common generator patterns:
- **CLI file generation** - Standardized CLI interfaces for all generators
- **Plugin manifest generation** - Consistent plugin metadata
- **Documentation generation** - Template-based README generation (existing system)

## Architecture

```
packages/core/
├── templates/
│   ├── cli.mustache              # CLI file template
│   └── plugin-manifest.mustache # Plugin manifest template
├── utils/
│   ├── cli-template-data.js      # Template data definitions
│   └── template-generator.js     # Template rendering utilities
└── scripts/
    └── regenerate-cli-files.js   # Regeneration script
```

## CLI Template System

### Template Data Structure

All CLI descriptions, options, and patterns are centralized in `cli-template-data.js`:

```javascript
export const CLI_TEMPLATES = {
  descriptions: {
    html: 'Generate professional styled HTML documentation from OpenAPI specs',
    markdown: 'Generate Confluence-friendly Markdown documentation from OpenAPI specs',
    // ...
  },
  commonOptions: [
    {
      flag: '-c, --config <path>',
      description: 'Path to confytome.json config file',
      defaultValue: 'DEFAULT_CONFIG_FILES.CONFYTOME'
    },
    // ...
  ],
  generatorInfo: {
    html: {
      name: 'HTML Generator',
      className: 'SimpleDocsGenerator',
      features: ['Professional styling', 'Responsive design', ...],
      // ...
    }
  }
};
```

### CLI Template (`cli.mustache`)

The template uses logic-less Mustache syntax with unescaped output (`{{{ }}}`) to avoid HTML encoding issues:

```mustache
#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs';
import { createCLI } from '@confytome/core/utils/{{{cliHelper}}}';
import { DEFAULT_OUTPUT_DIR, DEFAULT_CONFIG_FILES } from '@confytome/core/constants.js';
import { {{{className}}} } from './{{{mainFile}}}';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

program
  .name('{{{packageName}}}')
  .description('{{{description}}}')
  .version(pkg.version){{#options}}
  .option('{{{flag}}}', '{{{description}}}'{{#defaultValue}}, {{{defaultValue}}}{{/defaultValue}}){{/options}}
  .parse(process.argv);

const {{{generatorType}}}CLI = createCLI('{{{generatorType}}}', {{{className}}}, '{{{progressMessage}}}');
await {{{generatorType}}}CLI(program, pkg);
```

## Usage

### Regenerate CLI Files

```bash
# Validate existing files
npm run regenerate:cli:validate

# Regenerate all CLI files
npm run regenerate:cli

# Or directly with node
node packages/core/scripts/regenerate-cli-files.js
```

### Programmatic Usage

```javascript
import { writeCLIFile } from '@confytome/core/utils/template-generator.js';

// Generate CLI file for html generator
await writeCLIFile('html', '/path/to/html/package', {
  cliHelper: 'cli-helper.js'
});

// Generate plugin manifest
await writePluginManifest('markdown', '/path/to/markdown/package', {
  version: '1.4.3',
  externalTools: []
});
```

## Benefits

### ✅ Consistency
- All generators use identical CLI patterns
- Standardized option definitions and descriptions
- Consistent import paths and naming conventions

### ✅ Maintainability  
- Single source of truth for CLI descriptions and options
- Template updates automatically apply to all generators
- Eliminates copy-paste errors and drift between packages

### ✅ Inversion of Control
- Generators define behavior, templates define structure
- Easy to add new CLI options across all generators
- Centralized updates for CLI interface changes

### ✅ Developer Experience
- Auto-generated CLI files reduce boilerplate
- Template validation catches errors early
- Easy to create new generators with consistent interfaces

## Implementation Details

### Template Data Processing

The `template-generator.js` handles:
- **Option processing** - Converts template data to Mustache format
- **Import path resolution** - Handles cli-helper vs cli-helpers differences  
- **Default value handling** - Resolves constant references
- **Escaping control** - Uses unescaped output for clean code generation

### Error Handling

The regeneration script includes:
- **File validation** - Checks existing files before regeneration
- **Template validation** - Validates Mustache templates
- **Error reporting** - Clear error messages for debugging
- **Rollback safety** - Preserves existing files on errors

## Extension Points

### Adding New Generators

1. Add generator info to `CLI_TEMPLATES.generatorInfo`
2. Add CLI description to `CLI_TEMPLATES.descriptions`  
3. Update the regeneration script's `GENERATORS` array
4. Run `npm run regenerate:cli`

### Adding New CLI Options

1. Add option to `CLI_TEMPLATES.commonOptions`
2. Regenerate all CLI files with `npm run regenerate:cli`
3. All generators automatically inherit the new option

### Custom Template Data

Pass additional options to override template defaults:

```javascript
await writeCLIFile('custom-generator', packagePath, {
  cliHelper: 'custom-cli-helper.js',
  customOption: 'custom-value'
});
```

## Integration with Documentation System

This Mustache templating system complements the existing documentation template system:
- **CLI Templates** - Generate consistent CLI interfaces  
- **README Templates** - Generate consistent documentation (existing)
- **Plugin Manifests** - Generate consistent metadata (in development)

Together, these systems eliminate repetition while maintaining the flexibility for generator-specific customizations.

---

**Next Steps**: Extend this system to plugin manifests and consider using Mustache templates for other repetitive code patterns in the project.
