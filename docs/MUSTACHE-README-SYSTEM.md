# Enhanced Mustache-based README Generation System

The confytome project now includes a comprehensive Mustache-based README generation system that replaces the previous string replacement approach with proper logic-less templating.

## Overview

### Before vs After

**Previous System:**
- Simple `{{VARIABLE}}` string replacement
- No conditionals or loops
- Manual escaping required
- Limited data structure support

**New Mustache System:**
- Real Mustache templating with `{{{unescaped}}}` and `{{#section}}` support
- Conditional sections (`{{#hasFeature}}...{{/hasFeature}}`)
- Loop support for arrays (`{{#features}}...{{/features}}`)
- Structured data with proper escaping
- Template validation and error reporting

## Architecture

```
packages/core/
├── templates/
│   ├── README-workspace.mustache    # Main project README
│   ├── README-core.mustache        # Core package README
│   └── README-generator.mustache   # Generator package README
├── utils/
│   ├── readme-template-data.js     # Structured template data
│   └── mustache-readme-generator.js # Mustache rendering engine
└── scripts/
    └── regenerate-readmes.js       # Generation script
```

## Template Features

### Conditional Sections
```mustache
{{#hasTroubleshooting}}
## 🛠️ Troubleshooting
{{#troubleshooting}}
#### {{{issue}}}
{{{solution}}}
{{/troubleshooting}}
{{/hasTroubleshooting}}
```

### Loop Support
```mustache
{{#features}}
- {{{.}}}
{{/features}}
```

### Structured Data
```mustache
{{#badges}}
[![{{{name}}}]({{{url}})]({{{link}}})
{{/badges}}
```

### Unescaped Output
```mustache
{{{packageName}}}    <!-- Raw output -->
{{packageName}}      <!-- HTML escaped -->
```

## Template Data Structure

### Generator Packages
```javascript
{
  packageName: '@confytome/html',
  description: 'Professional styled HTML documentation generator...',
  features: [
    '🎨 **Professional Styling** - Clean, modern design',
    '📱 **Mobile-First Design** - Works perfectly on all devices'
  ],
  dependencies: [
    { name: 'commander', description: 'CLI argument parsing' }
  ],
  outputExamples: {
    fileStructure: [
      { file: 'api-docs.html', description: 'Professional HTML docs' }
    ],
    features: ['**Color-coded methods**', '**Responsive navigation**']
  },
  troubleshooting: [
    { issue: 'Large file size', solution: 'This is intentional...' }
  ]
}
```

### Workspace Package
```javascript
{
  projectName: '🔌 confytome',
  badges: [
    { name: 'npm version', url: 'badge-url', link: 'npm-link' }
  ],
  description: 'Plugin-based API documentation generator...'
}
```

## Usage

### Generate All READMEs
```bash
# Generate all package READMEs
npm run regenerate:readmes

# Validate templates only
npm run regenerate:readmes:validate

# Preview generated content
npm run regenerate:readmes:preview
```

### Programmatic Usage
```javascript
import { generateREADME, writeREADME } from '@confytome/core/utils/mustache-readme-generator.js';

// Generate content
const content = generateREADME('html', { customOption: 'value' });

// Write to file
const path = writeREADME('markdown', './packages/markdown');
```

### CLI Script
```bash
# Direct script usage
node packages/core/scripts/regenerate-readmes.js

# With options
node packages/core/scripts/regenerate-readmes.js --validate
node packages/core/scripts/regenerate-readmes.js --preview
node packages/core/scripts/regenerate-readmes.js --compare
```

## Template Validation

The system includes comprehensive template validation:

```javascript
import { validateREADMETemplates } from '@confytome/core/utils/mustache-readme-generator.js';

const isValid = validateREADMETemplates();
// Checks for:
// - Template file existence
// - Mustache syntax errors
// - Unclosed tags
// - Template accessibility
```

## Benefits Over Previous System

### ✅ Enhanced Features
- **Conditional Content**: Show/hide sections based on data
- **Loop Support**: Generate lists and tables dynamically
- **Structured Data**: Proper data organization and access
- **Template Validation**: Catch errors early in development

### ✅ Better Developer Experience
- **Real Templates**: Logic-less templating with proper syntax
- **Error Reporting**: Clear error messages for debugging
- **Preview Mode**: See generated content without writing files
- **Comparison Mode**: Compare old vs new approaches

### ✅ Maintainability
- **Single Source**: Template data centralized in one location
- **Type Safety**: Structured data with consistent interfaces
- **Template Reuse**: Shared templates across similar packages
- **Version Control**: Templates tracked as code with diffs

## Customization

### Adding New Package Types
```javascript
// In readme-template-data.js
export function getREADMETemplateData(generatorType) {
  const generatorData = {
    // ... existing generators
    newGenerator: {
      packageName: '@confytome/new',
      description: 'New generator description',
      features: ['Feature 1', 'Feature 2'],
      // ... other data
    }
  };
}
```

### Custom Template Options
```javascript
const content = generateREADME('html', {
  customSection: true,
  additionalFeatures: ['Extra feature 1', 'Extra feature 2']
});
```

### Template Inheritance
All generator packages use the same base template (`README-generator.mustache`) with different data, ensuring consistency while allowing customization.

## Integration with Existing Systems

### With CLI Template System
- **CLI Generation**: `npm run regenerate:cli`
- **README Generation**: `npm run regenerate:readmes`
- **Combined Updates**: Both systems use Mustache for consistency

### With Documentation Pipeline
```bash
# Complete documentation regeneration
npm run regenerate:cli
npm run regenerate:readmes
node docs/scripts/generate-readme.js  # Legacy system (optional)
```

## Migration Path

### From Legacy System
1. **Template Migration**: Convert `{{VARIABLE}}` to `{{{variable}}}`
2. **Data Structure**: Organize flat variables into structured objects
3. **Feature Enhancement**: Add conditionals and loops where beneficial
4. **Validation**: Run template validation before deployment

### Backwards Compatibility
The new system can coexist with the old system during migration:
- Old templates continue to work
- New features available immediately
- Gradual migration possible

## Performance Considerations

### Template Compilation
- Templates are read from disk each time (no caching)
- Fast generation (~50ms per README)
- Memory efficient for large projects

### Optimization Opportunities
- Template caching for repeated generation
- Partial template support for reusable sections
- Parallel generation for multiple packages

## Future Enhancements

### Template System Extensions
- **Partials**: Reusable template sections
- **Helpers**: Custom functions for data processing
- **Theme Support**: Multiple visual themes for packages
- **Multi-language**: Generate READMEs in multiple languages

### Developer Tools
- **Live Preview**: Real-time template editing with preview
- **Template Linting**: Advanced syntax and style checking
- **Data Validation**: Runtime validation of template data
- **Generator CLI**: Interactive README generation tool

---

**Next Steps**: Consider extending this Mustache system to other documentation generation needs in the project, such as API documentation templates, configuration file templates, and development guides.