# ADR-011: Interface-Based Generator System

## Status
Accepted

## Context
The confytome project previously relied on manifest files (`confytome-plugin.json`) for generator discovery and management. This approach had several limitations:

1. **Manifest Maintenance**: Developers had to maintain separate JSON files alongside their generator code, creating potential for drift between implementation and metadata
2. **Runtime Discovery**: The system couldn't dynamically discover generators or validate their capabilities without parsing external files
3. **Type Safety**: No compile-time or runtime validation of generator compliance with expected contracts
4. **Scalability**: As the number of generators grew, manifest-based discovery became more complex and error-prone

The existing system required generators to:
- Maintain a `confytome-plugin.json` manifest file
- Export specific class names defined in the manifest
- Follow undocumented conventions for method signatures

This created a disconnect between the code and its metadata, leading to maintenance overhead and potential inconsistencies.

## Decision
We will implement an interface-based generator system that replaces manifest file dependency with runtime introspection and strict interface contracts.

### Key Components

1. **IGenerator Interface**: A well-defined contract that all generators must implement
   ```javascript
   export class IGenerator {
     static getMetadata() // Return generator metadata
     async validate(options) // Validate prerequisites
     async initialize(options) // Initialize generator
     async generate(options) // Generate output
     async cleanup() // Clean up resources
   }
   ```

2. **Interface Validation**: Runtime validation using `GeneratorValidator` to ensure compliance
3. **Automatic Discovery**: Scan for `generate-*.js` files and introspect their exports
4. **Metadata Embedding**: Generator metadata is embedded as static methods rather than external files

### Implementation Approach

- **GeneratorRegistry**: Rewritten to use file scanning and interface introspection instead of manifest parsing
- **GeneratorFactory**: Updated to work with interface-compliant generators and enforce lifecycle methods
- **Generator Updates**: All existing generators updated to implement the `IGenerator` interface
- **Validation**: Both class-level (static) and instance-level validation for comprehensive error checking

## Consequences

### Positive
- **Reduced Maintenance**: No more manifest files to keep in sync with code
- **Type Safety**: Strong interface contracts prevent runtime errors
- **Better Developer Experience**: Clear contracts and validation messages
- **Runtime Introspection**: System can dynamically discover and validate generators
- **Consistency**: All generators follow the same interface pattern
- **Future-Proof**: Easy to extend interface for new capabilities

### Negative
- **Migration Effort**: All existing generators needed to be updated
- **Breaking Change**: Removes backward compatibility with manifest-based generators
- **Learning Curve**: Developers need to understand the new interface contract

### Neutral
- **Code Volume**: Slightly more code per generator (implementing interface methods)
- **Performance**: Negligible impact - interface validation is fast and happens at startup

## Technical Details

### Interface Structure
```javascript
/**
 * Generator metadata structure
 */
typedef GeneratorMetadata {
  name: string           // Generator identifier
  type: string          // 'openapi-generator' | 'spec-consumer'
  description: string   // Human-readable description  
  className: string     // Class name for instantiation
  outputs: string[]     // Output file patterns
  standalone: boolean   // Can run independently
  version: string      // Generator version
  author: string       // Generator author
  dependencies: Object // NPM dependencies
  peerDependencies: Object // NPM peer dependencies
}
```

### Discovery Process
1. Scan `packages/*/generate-*.js` files
2. Dynamically import each module
3. Find classes with `getMetadata()` static method
4. Validate interface compliance using `GeneratorValidator`
5. Extract metadata and register generator

### Validation Levels
1. **Static Validation**: Ensures class has required static methods
2. **Interface Validation**: Validates class implements all required instance methods
3. **Metadata Validation**: Validates structure and content of generator metadata
4. **Runtime Validation**: Instance-level validation before generation

## Implementation Status
- ✅ IGenerator interface created
- ✅ All 5 generators updated (core, html, markdown, swagger, postman)
- ✅ GeneratorRegistry rewritten for interface discovery
- ✅ GeneratorFactory updated for interface lifecycle
- ✅ Backward compatibility code removed
- ✅ Redundant methods cleaned up
- ✅ Package.json exports updated
- ✅ All tests passing

## Migration Guide
For future generators, developers should:

1. Import the interface: `import { IGenerator, GeneratorTypes } from '@confytome/core/interfaces/IGenerator.js'`
2. Implement static `getMetadata()` method returning proper metadata structure
3. Implement all required interface methods: `validate()`, `initialize()`, `generate()`, `cleanup()`
4. Ensure `generate()` method returns `{success: boolean, outputs: string[], stats: Object}`
5. Follow the generator lifecycle: validate → initialize → generate → cleanup

## References
- Original plugin registry implementation: `adr-003-plugin-registry-approach.md`
- Base generator patterns: `adr-002-base-generator-pattern.md`
- Service factory integration: `adr-004-service-factory-simplification.md`

## Date
2025-09-07
