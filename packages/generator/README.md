# @confytome/generator

Template generation system for confytome CLI files, manifests, and documentation. Provides centralized template management using Mustache templating to maintain consistency across all generator packages.

## Features

- 🎯 **CLI Generation** - Generate consistent CLI files across all generator packages
- 📄 **Manifest Generation** - Generate plugin manifests with proper dependencies and metadata
- 📚 **README Generation** - Generate comprehensive documentation using Mustache templates
- 🔍 **Quality Validation** - Validate generated content matches expected quality standards
- 🔧 **Template Management** - Centralized template storage and management

## Package Structure

```
packages/generator/
├── src/
│   ├── index.js                      # Main exports
│   ├── cli-template-data.js          # CLI template data
│   ├── template-generator.js         # CLI and manifest generation
│   ├── readme-template-data.js       # README template data
│   └── mustache-readme-generator.js  # README generation
├── templates/
│   ├── cli.mustache                  # CLI file template
│   ├── plugin-manifest.mustache     # Plugin manifest template
│   ├── README-workspace.mustache    # Workspace README template
│   ├── README-core.mustache         # Core package README template
│   └── README-generator.mustache    # Generator package README template
└── scripts/
    ├── regenerate-cli-files.js       # CLI regeneration script
    ├── regenerate-readmes.js         # README regeneration script  
    └── validate-readme-quality.js   # README quality validation
```

## Usage

### CLI Generation

```bash
# Regenerate all CLI files and manifests
npm run regenerate:cli

# Validate existing CLI files
npm run regenerate:cli:validate
```

### README Generation

```bash
# Regenerate all README files
npm run regenerate:readmes

# Validate README quality
npm run regenerate:readmes:quality

# Preview README changes
npm run regenerate:readmes:preview
```

### Programmatic Usage

```javascript
import { 
  generateCLIFile, 
  generatePluginManifest, 
  generateREADME 
} from '@confytome/generator';

// Generate CLI file
const cliContent = generateCLIFile('html');

// Generate manifest
const manifestContent = generatePluginManifest('markdown');

// Generate README
const readmeContent = generateREADME('workspace');
```

## Template System

The generator uses Mustache templates for logic-less templating:

- **Variables**: `{{variable}}` - Simple variable substitution
- **Sections**: `{{#section}}...{{/section}}` - Conditional blocks and loops  
- **Inverted Sections**: `{{^section}}...{{/section}}` - Conditional negation
- **Unescaped**: `{{&variable}}` - Unescaped output for HTML/URLs

## Generated Files

| Generator | CLI File | Manifest | README |
|-----------|----------|----------|--------|
| html | ✅ | ✅ | ✅ |
| markdown | ✅ | ✅ | ✅ |
| swagger | ✅ | ✅ | ✅ |
| postman | ✅ | ✅ | ✅ |
| core | - | ✅ | ✅ |
| workspace | - | - | ✅ |

## Development

The generator package is isolated from the core system and can be developed independently. All template generation logic is centralized here to maintain consistency and reduce code duplication across the confytome ecosystem.

## License

MIT