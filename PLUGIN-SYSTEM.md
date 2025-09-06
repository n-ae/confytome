# Confytome Plugin System

The Confytome plugin system provides a **simplified, maintainable architecture** for creating and managing documentation generators. It uses **manifest-based plugin discovery** for better maintainability and easier debugging.

## Architecture Overview

The plugin system consists of several key components:

- **Plugin Manifests**: `confytome-plugin.json` files describing each generator
- **GeneratorRegistry**: Discovers and registers generators via manifest files  
- **GeneratorFactory**: Creates generator instances with dependency injection
- **RegistryOrchestrator**: Manages generator execution and dependencies

## Simplified Plugin Discovery

### Manifest Files

Each generator package contains a `confytome-plugin.json` manifest file that describes the plugin:

```json
{
  "name": "html",
  "type": "spec-consumer",
  "description": "Professional styled HTML documentation generator",
  "main": "./generate-html.js",
  "className": "SimpleDocsGenerator",
  "version": "1.3.0",
  "author": "nae",
  "tags": ["html", "documentation", "responsive"],
  "dependencies": {
    "commander": "^14.0.0"
  },
  "peerDependencies": {
    "@confytome/core": "^1.2.0"
  },
  "outputs": ["api-docs.html"],
  "inputType": "openapi-spec",
  "outputFormat": "html",
  "standalone": true
}
```

### Manifest Schema

**Required fields:**
- `name`: Plugin identifier (used for generator lookup)
- `type`: Plugin type (`openapi-generator` or `spec-consumer`)
- `description`: Human-readable description
- `main`: Path to the generator file (relative to manifest)
- `className`: Name of the generator class to instantiate

**Optional fields:**
- `version`: Plugin version
- `author`: Plugin author
- `tags`: Array of searchable tags
- `dependencies`: npm dependencies
- `peerDependencies`: Peer dependencies
- `outputs`: Array of generated file names
- `inputType`: What the generator consumes
- `outputFormat`: What the generator produces
- `standalone`: Whether it can run independently
- `features`: Array of feature descriptions
- `externalTools`: External tools required (e.g., ["widdershins"])

## Core Components

### GeneratorRegistry

The registry now uses **manifest-based discovery** instead of complex reflection:

```javascript
import { generatorRegistry } from '@confytome/core/services/GeneratorRegistry.js';

// Initialize and discover all generators via manifest files
await generatorRegistry.initialize();

// Get all registered generators
const generators = generatorRegistry.getAllGenerators();
// → ['core', 'html', 'markdown', 'swagger', 'postman']

// Get specific generator
const htmlGen = generatorRegistry.getGenerator('html');

// Get generator info
const info = generatorRegistry.getGeneratorInfo('html');
console.log(info);
// → { name: 'html', type: 'spec-consumer', description: '...', ... }

// Validate generator
const validation = generatorRegistry.validateGenerator('html');
// → { valid: true, errors: [], warnings: [] }
```

### GeneratorFactory

Provides a clean interface for creating and managing generators:

```javascript
import GeneratorFactory from '@confytome/core/services/GeneratorFactory.js';

// Create a generator instance
const generator = await GeneratorFactory.createGenerator(
  'html', 
  './docs', 
  { excludeBrand: true }
);

// Execute a generator
const result = await GeneratorFactory.executeGenerator('html');

// List all available generators
const generators = await GeneratorFactory.listGenerators();

// Get generators by type
const specConsumers = await GeneratorFactory.getGeneratorsByType('spec-consumer');
```

## Plugin Types

### 1. OpenAPI Generator (`openapi-generator`)

Generates OpenAPI specifications from source code (like JSDoc comments).

**Example:** `@confytome/core`
- Input: JSDoc comments in source files
- Output: `api-spec.json` (OpenAPI specification)

### 2. Spec Consumer (`spec-consumer`) 

Consumes OpenAPI specifications to generate various documentation formats.

**Examples:**
- `@confytome/html`: OpenAPI → Professional HTML docs
- `@confytome/markdown`: OpenAPI → Confluence-friendly Markdown
- `@confytome/swagger`: OpenAPI → Interactive Swagger UI
- `@confytome/postman`: OpenAPI → Postman collection

## Creating New Plugins

### 1. Create Plugin Structure

```
packages/my-generator/
├── confytome-plugin.json     # Plugin manifest
├── generate-my-format.js     # Main generator file
├── package.json              # npm package config
└── README.md                # Documentation
```

### 2. Write Plugin Manifest

```json
{
  "name": "my-format",
  "type": "spec-consumer",
  "description": "Generates documentation in MyFormat",
  "main": "./generate-my-format.js",
  "className": "MyFormatGenerator",
  "version": "1.0.0",
  "author": "Your Name",
  "tags": ["custom", "format"],
  "outputs": ["api-docs.myformat"],
  "inputType": "openapi-spec",
  "outputFormat": "myformat",
  "standalone": true
}
```

### 3. Implement Generator Class

```javascript
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';

export class MyFormatGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs', services = null) {
    super('generate-my-format', 'Generating MyFormat documentation', outputDir, services);
  }

  async generate() {
    console.log('🎨 Generating MyFormat documentation...');
    
    return this.generateDocument('myformat', 'api-docs.myformat', (openApiSpec, services) => {
      return this.convertToMyFormat(openApiSpec);
    });
  }

  convertToMyFormat(openApiSpec) {
    // Your custom conversion logic
    return 'MyFormat content based on OpenAPI spec';
  }
}
```

### 4. Register and Test

The plugin will be automatically discovered via its manifest file when the registry initializes.

```javascript
import { generatorRegistry } from '@confytome/core/services/GeneratorRegistry.js';

await generatorRegistry.initialize();
console.log(generatorRegistry.getAllGenerators());
// Should include 'my-format'
```

## Best Practices

### Plugin Development
1. **Use descriptive manifest files** with rich metadata
2. **Follow naming conventions**: `generate-{format}.js` for generator files
3. **Extend base classes**: Use `SpecConsumerGeneratorBase` or `OpenAPIGeneratorBase`
4. **Document external dependencies** in manifest `externalTools` field
5. **Test plugin discovery**: Ensure manifest is valid JSON with required fields

### Plugin Discovery
1. **Prefer manifest-based discovery** over reflection
2. **Validate plugins early** using `validateGenerator()`
3. **Handle plugin failures gracefully** with proper error messages
4. **Cache plugin information** for better performance

## Debugging Plugin Issues

### Common Problems

**Plugin Not Found:**
```javascript
// Check if manifest exists
const manifestPath = 'packages/my-plugin/confytome-plugin.json';
console.log(fs.existsSync(manifestPath));

// Check manifest validity
const manifest = JSON.parse(fs.readFileSync(manifestPath));
console.log('Required fields:', ['name', 'type', 'main', 'className']);
```

**Class Not Found:**
```javascript
// Verify className matches export
console.log('Manifest className:', manifest.className);
console.log('Available exports:', Object.keys(module));
```

**Validation Errors:**
```javascript
const validation = generatorRegistry.validateGenerator('my-plugin');
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  console.warn('Validation warnings:', validation.warnings);
}
```

This simplified plugin system maintains all existing functionality while dramatically improving maintainability and debugging capabilities.