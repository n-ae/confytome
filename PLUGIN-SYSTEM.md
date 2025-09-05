# Confytome Plugin System

The Confytome plugin system provides a flexible, extensible architecture for creating and managing documentation generators. It supports both workspace-local generators and external plugins via npm packages.

## Architecture Overview

The plugin system consists of several key components:

- **GeneratorRegistry**: Discovers and registers all available generators
- **GeneratorFactory**: Creates generator instances with dependency injection
- **RegistryOrchestrator**: Manages generator execution and dependencies
- **PluginInterface**: Tools for external plugin developers

## Core Components

### GeneratorRegistry

Automatically discovers generators in:
- Workspace packages (`packages/*/generate-*.js`)
- External npm packages (`confytome-plugin-*` or `@confytome/plugin-*`)

```javascript
import { generatorRegistry } from '@confytome/core/services/GeneratorRegistry.js';

// Initialize and discover all generators
await generatorRegistry.initialize();

// Get all registered generators
const generators = generatorRegistry.getAllGenerators();

// Get specific generator
const htmlGen = generatorRegistry.getGenerator('generate-html');
```

### GeneratorFactory

Provides a clean interface for creating and managing generators:

```javascript
import GeneratorFactory from '@confytome/core/services/GeneratorFactory.js';

// Create a generator instance
const generator = await GeneratorFactory.createGenerator(
  'generate-html', 
  './docs', 
  { excludeBrand: true }
);

// Execute a generator
const result = await GeneratorFactory.executeGenerator('generate-html');

// List all available generators
const generators = await GeneratorFactory.listGenerators();
```

## CLI Commands

The plugin system adds several new CLI commands:

### List Generators
```bash
confytome generators              # List all generators
confytome generators --json       # JSON output
```

### Generator Information
```bash
confytome info generate-html      # Detailed generator info
confytome info generate-markdown  # Markdown generator details
```

### Recommended Generators
```bash
confytome recommended             # Show available generators
confytome recommended --json      # JSON output
```

### Validation
```bash
confytome validate                # Validate all generators
confytome validate generate-html  # Validate specific generator
```

### Execute Generators
```bash
confytome run generate-html       # Run HTML generator
confytome run generate-html generate-markdown  # Multiple generators
confytome run-all                 # All spec consumer generators
```

## Creating External Plugins

### Plugin Package Structure

External plugins should follow this naming convention:
- `confytome-plugin-<name>` 
- `@confytome/plugin-<name>`

Example `package.json`:
```json
{
  "name": "confytome-plugin-custom",
  "version": "1.0.0",
  "description": "Custom documentation generator for Confytome",
  "main": "index.js",
  "type": "module",
  "peerDependencies": {
    "@confytome/core": "^1.2.0"
  },
  "keywords": ["confytome", "plugin", "documentation", "generator"]
}
```

### Basic Plugin Implementation

```javascript
// index.js
import { PluginBase, PluginUtils } from '@confytome/core/services/PluginInterface.js';

// Create plugin instance
const plugin = new PluginBase({
  name: 'confytome-plugin-custom',
  type: 'custom',
  description: 'Custom documentation generator',
  version: '1.0.0',
  author: 'Your Name',
  homepage: 'https://github.com/yourusername/confytome-plugin-custom'
});

// Create a custom generator using utility
const CustomGenerator = PluginUtils.createSpecConsumerGenerator(
  'generate-custom',
  'custom',
  async (openApiSpec, services) => {
    // Your custom generation logic
    const title = openApiSpec.info.title;
    const version = openApiSpec.info.version;
    
    return `# ${title} v${version}\\n\\nCustom documentation content...`;
  },
  {
    description: 'Generate custom format documentation',
    outputFileName: 'api-docs.custom',
    successMessage: 'Custom documentation generated successfully'
  }
);

// Register the generator
plugin.registerGenerator('generate-custom', CustomGenerator);

// Export the plugin
export default plugin;
export const generators = plugin.getGenerators();
```

### Advanced Plugin with Custom Class

```javascript
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';
import { PluginBase } from '@confytome/core/services/PluginInterface.js';

class CustomDocGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs', services = null) {
    super('generate-custom', 'Custom documentation generator', outputDir, services);
  }

  async generate() {
    console.log('🎨 Generating custom documentation...');
    
    return this.generateDocument('custom', 'api-docs.custom', async (openApiSpec, services) => {
      // Custom generation logic with access to services
      const branding = services.branding.generateForHtml();
      
      return `
        <h1>${openApiSpec.info.title}</h1>
        <p>${openApiSpec.info.description}</p>
        <div class="branding">${branding}</div>
      `;
    });
  }

  getSuccessMessage() {
    return 'Custom documentation generation completed';
  }
}

const plugin = new PluginBase({
  name: 'confytome-plugin-advanced',
  type: 'custom',
  description: 'Advanced custom documentation generator',
  version: '1.0.0'
});

plugin.registerGenerator('generate-custom', CustomDocGenerator);

export default plugin;
export const generators = plugin.getGenerators();
```

## Generator Development Guidelines

### Base Classes

Choose the appropriate base class:

- **SpecConsumerGeneratorBase**: For generators that process existing OpenAPI specs (HTML, Markdown, etc.)
- **OpenAPIGeneratorBase**: For generators that create OpenAPI specs from JSDoc
- **BaseGenerator**: For completely custom generators

### Required Methods

All generators must implement:
- `generate()`: Main generation logic
- `getSuccessMessage()`: Success message for completion

### Service Integration

Generators have access to shared services:

```javascript
async generate() {
  const services = this.getServices(import.meta.url, 'html');
  
  // Access branding service
  const branding = services.branding.generateForHtml();
  
  // Access version service
  const version = services.version.getPackageVersion(import.meta.url);
  
  // Access template service
  const templateDir = services.template.getWiddershinsPath();
}
```

## Plugin Discovery

The system automatically discovers plugins by:

1. **Workspace packages**: Scanning `packages/*/generate-*.js` files
2. **External packages**: Looking for `confytome-plugin-*` dependencies in package.json
3. **Dynamic import**: Loading generator classes and extracting metadata

## Validation and Dependencies

The plugin system validates:
- Generator class structure and required methods
- Peer dependencies availability
- Metadata completeness
- Compatibility with current Confytome version

## Testing Your Plugin

Test your plugin locally:

```bash
# Link your plugin for local testing
npm link confytome-plugin-custom

# Verify it's discovered
confytome generators

# Get detailed information
confytome info generate-custom

# Validate dependencies
confytome validate generate-custom

# Execute the generator
confytome run generate-custom
```

## Publishing Plugins

1. Ensure your plugin follows the naming convention
2. Add `@confytome/core` as a peer dependency
3. Include proper keywords in package.json
4. Test with a real Confytome project
5. Publish to npm

```bash
npm publish
```

## Plugin Registry Integration

Once published, users can install and use your plugin:

```bash
# Install the plugin
npm install confytome-plugin-custom

# Plugin is automatically discovered
confytome generators

# Use the plugin
confytome run generate-custom
```

## Examples and Templates

### Minimal Plugin Template

```javascript
import { PluginUtils } from '@confytome/core/services/PluginInterface.js';

// Generate example plugin code
const exampleCode = PluginUtils.createExamplePlugin();
console.log(exampleCode);
```

### Real-world Examples

Check the built-in generators for examples:
- `packages/html/generate-html.js` - HTML documentation
- `packages/markdown/generate-markdown.js` - Markdown with external tools
- `packages/swagger/generate-swagger.js` - Static file embedding

## Best Practices

1. **Follow naming conventions**: Use `confytome-plugin-*` or `@confytome/plugin-*`
2. **Extend base classes**: Don't create generators from scratch
3. **Use shared services**: Leverage branding, version, and template services
4. **Validate input**: Check OpenAPI spec structure
5. **Handle errors gracefully**: Provide helpful error messages
6. **Document thoroughly**: Include clear README and examples
7. **Test extensively**: Test with various OpenAPI specs

## Troubleshooting

### Plugin Not Discovered
- Check naming convention
- Verify package.json structure
- Ensure proper exports

### Validation Failures
- Check peer dependencies
- Verify generator class structure
- Review error messages from `confytome validate`

### Runtime Errors
- Check service integration
- Verify file paths and permissions
- Review generator implementation

## API Reference

See the JSDoc comments in:
- `packages/core/services/GeneratorRegistry.js`
- `packages/core/services/GeneratorFactory.js` 
- `packages/core/services/PluginInterface.js`
- `packages/core/utils/base-generator.js`

For complete API documentation and examples.