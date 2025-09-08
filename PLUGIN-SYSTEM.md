# Confytome Plugin System

The Confytome plugin system provides a **simplified, maintainable architecture** for creating and managing documentation generators. It uses **interface-based plugin discovery** for better maintainability and type safety.

## Architecture Overview

The plugin system consists of several key components:

- **GeneratorRegistry**: Discovers and registers generators via interface introspection
- **GeneratorFactory**: Creates generator instances with dependency injection and manages execution  
- **IGenerator Interface**: Standardized contract that all generators must implement
- **MetadataFactory**: Provides standardized metadata creation patterns

## Interface-Based Plugin Discovery

### Generator Interface Contract

Each generator must implement the `IGenerator` interface with these required methods:

```javascript
import { IGenerator, MetadataFactory } from '@confytome/core/interfaces/IGenerator.js';

class MyGenerator extends IGenerator {
  // Static metadata method (required for discovery)
  static getMetadata() {
    return MetadataFactory.createSpecConsumerMetadata(
      'my-generator',
      'My generator description',
      'MyGenerator', 
      'output.ext'
    );
  }

  // Instance lifecycle methods (required)
  async validate(options = {}) { /* Validate prerequisites */ }
  async initialize(options = {}) { /* Initialize generator */ }
  async generate(options = {}) { /* Generate documentation */ }
  async cleanup() { /* Cleanup resources */ }
}
```

### Automatic Discovery Process

1. **File Scanning**: Registry scans `packages/*/generate-*.js` files
2. **Dynamic Import**: Loads each generator module
3. **Interface Detection**: Finds classes with `getMetadata()` static method
4. **Interface Validation**: Validates full `IGenerator` compliance
5. **Registration**: Adds valid generators to registry

### Metadata Schema

The `getMetadata()` method must return an object with these fields:

**Required fields:**
- `name`: Generator identifier (e.g., 'html', 'markdown')
- `type`: Generator type (`'openapi-generator'` or `'spec-consumer'`)
- `description`: Human-readable description
- `className`: Class name for instantiation
- `outputs`: Array of output file patterns

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
- `externalTools`: External tools required (mostly empty for internal dependencies)

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
├── generate-my-format.js     # Main generator file (must start with 'generate-')
├── utils/                    # Supporting utilities
├── templates/               # Templates (if applicable)
├── package.json              # npm package config
└── README.md                # Documentation
```

### 2. Implement Generator Interface

Create your generator class implementing the `IGenerator` interface:

```javascript
import { SpecConsumerGeneratorBase } from '@confytome/core/utils/base-generator.js';
import { MetadataFactory } from '@confytome/core/interfaces/IGenerator.js';

export class MyFormatGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir, services = null) {
    super('generate-my-format', 'Generating MyFormat documentation', outputDir, services);
  }

  // Required: Static metadata for discovery
  static getMetadata() {
    return MetadataFactory.createSpecConsumerMetadata(
      'my-format',
      'Generates documentation in MyFormat',
      'MyFormatGenerator',
      'api-docs.myformat'
    );
  }

  // Required: Validate generator prerequisites
  async validate(options = {}) {
    const baseValidation = await super.validate(options);
    // Add any custom validation
    return baseValidation;
  }

  // Required: Generate documentation
  async generate(options = {}) {
    return this.generateDocument('myformat', 'api-docs.myformat', (spec, services) => {
      // Your format generation logic here
      return this.convertSpecToMyFormat(spec, services);
    });
  }
}

export default MyFormatGenerator;
```

### 3. Register and Test

The plugin will be automatically discovered via interface introspection when the registry initializes.

```javascript
import { GeneratorRegistry } from '@confytome/core/services/GeneratorRegistry.js';

const registry = new GeneratorRegistry();
await registry.initialize();
console.log(registry.listGenerators());
// Should include your new generator
```

### 4. Package Configuration

Update your `package.json` for proper npm package structure:

```json
{
  "name": "@confytome/my-format", 
  "main": "generate-my-format.js",
  "type": "module",
  "peerDependencies": {
    "@confytome/core": "^1.2.0"
  }
}
```

## Best Practices

### Plugin Development
1. **Implement full IGenerator interface** for automatic discovery
2. **Follow naming conventions**: `generate-{format}.js` for generator files
3. **Extend base classes**: Use `SpecConsumerGeneratorBase` or `OpenAPIGeneratorBase` 
4. **Provide static metadata**: Implement `getMetadata()` with complete information
5. **Handle errors gracefully**: Use base class error handling patterns
6. **Test interface compliance**: Ensure all required methods are implemented

### Plugin Discovery
1. **Use interface introspection** for automatic discovery
2. **Validate interface compliance** using `GeneratorValidator`
3. **Handle plugin failures gracefully** with proper error messages
4. **Follow generator lifecycle** (validate → initialize → generate → cleanup)

## Debugging Plugin Issues

### Common Problems

**Plugin Not Discovered:**
```javascript
// Check if generator file follows naming convention
const generatorPath = 'packages/my-plugin/generate-my-format.js';
console.log('File exists:', fs.existsSync(generatorPath));
console.log('Starts with "generate-":', path.basename(generatorPath).startsWith('generate-'));

// Check if getMetadata() is implemented
import MyGenerator from './generate-my-format.js';
console.log('Has getMetadata():', typeof MyGenerator.getMetadata === 'function');
```

**Interface Validation Errors:**
```javascript
import { GeneratorValidator } from '@confytome/core/interfaces/IGenerator.js';

// Validate interface compliance
const validation = GeneratorValidator.validateGeneratorClass(MyGenerator);
console.log('Interface valid:', validation.valid);
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}
```

**Metadata Issues:**
```javascript
// Check metadata structure
const metadata = MyGenerator.getMetadata();
console.log('Metadata:', metadata);

// Validate required fields
const required = ['name', 'type', 'description', 'className', 'outputs'];
const missing = required.filter(field => !metadata[field]);
if (missing.length > 0) {
  console.error('Missing required metadata fields:', missing);
}
```

This simplified plugin system maintains all existing functionality while dramatically improving maintainability and debugging capabilities.