# ADR-002: Base Generator Pattern for Consistency

## Status
Accepted

## Context
Different generators need consistent interfaces, error handling, and service access patterns. Without a common structure, each generator would implement its own approach to:

- Configuration loading and validation
- Error handling and logging
- Service instantiation (branding, templating, versioning)
- File output operations
- Success/failure reporting

## Decision
Implement a base generator pattern with two main base classes:

1. **`BaseGenerator`**: For OpenAPI spec creation generators
2. **`SpecConsumerGeneratorBase`**: For generators that consume existing OpenAPI specs

Both classes provide:
- Consistent constructor patterns with service injection
- Standardized error handling with descriptive messages
- Shared service factory integration
- Common file operations with proper error handling
- Unified logging and status reporting

## Consequences

### Positive
- **Consistency**: All generators follow the same patterns and interfaces
- **Reduced Boilerplate**: Common functionality implemented once in base classes
- **Error Handling**: Standardized error messages and failure modes
- **Testing**: Consistent testing patterns and shared test utilities
- **Service Integration**: Unified access to branding, templating, and version services
- **Maintainability**: Changes to common functionality require updates in one place

### Negative
- **Abstraction Overhead**: Developers must understand base class contracts
- **Inheritance Coupling**: Generators are coupled to base class implementations
- **Learning Curve**: New contributors need to understand the base class pattern

## Alternatives Considered

### Composition over Inheritance
- **Pros**: More flexible, easier to test individual components
- **Cons**: More verbose, duplicated setup code across generators

### No Common Pattern
- **Pros**: Complete flexibility for each generator
- **Cons**: Inconsistent interfaces, duplicated error handling, harder maintenance

### Functional Approach
- **Pros**: Simpler to understand, no inheritance complexity
- **Cons**: Harder to share common state and behavior

## Implementation Details

### BaseGenerator (OpenAPI Creation)
```javascript
class MyOpenAPIGenerator extends BaseGenerator {
  constructor(outputDir = './docs', services = null) {
    super('my-generator', 'Generating OpenAPI spec', outputDir, services);
  }

  async generate() {
    // Implementation here
    return this.writeFile('api-spec.json', specContent);
  }
}
```

### SpecConsumerGeneratorBase (Spec Consumption)
```javascript
class MyDocsGenerator extends SpecConsumerGeneratorBase {
  constructor(outputDir = './docs', services = null) {
    super('my-docs', 'Generating documentation', outputDir, services);
  }

  async generate() {
    return this.generateDocument('docs', 'api-docs.html', (spec, services) => {
      return this.generateHTML(spec, services);
    });
  }
}
```

### Key Methods Provided by Base Classes
- `writeFile(filename, content)`: Safe file writing with error handling
- `readSpec()`: OpenAPI spec loading and validation
- `generateDocument(type, filename, generator)`: Document generation with spec validation
- Consistent error handling and logging throughout