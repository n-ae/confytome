# ADR-007: Base Class Hierarchy Evaluation

## Status
Accepted (Evaluated January 2025)

## Context
During maintainability assessment, the base class hierarchy was identified as potentially over-engineered. The current structure includes:

- `BaseGenerator` (308 lines) - Common functionality for all generators
- `OpenAPIGeneratorBase extends BaseGenerator` - For spec creation from JSDoc
- `SpecConsumerGeneratorBase extends BaseGenerator` - For generators consuming existing specs

With 5 generators using this hierarchy, the question was whether to flatten it for simplicity.

## Decision
**Keep the current base class hierarchy** - it provides significant value and is appropriately designed.

## Analysis

### Current Usage (All generators properly utilize base classes)
- **OpenAPI Creation**: 1 generator (`generate-openapi`)
- **Spec Consumption**: 4 generators (`html`, `markdown`, `swagger`, `postman`)
- **Plugin System**: Dynamic generators also use the hierarchy

### Value Provided by Base Classes

1. **Code Elimination**: Template methods like `generateDocument()` eliminate duplication
2. **Consistent Patterns**: All generators follow same initialization and execution flow
3. **Error Handling**: Standardized error reporting and logging
4. **Service Integration**: Unified access to branding, templating, versioning services
5. **Statistics**: Common stats collection and reporting
6. **Validation**: Type-specific validation logic

### Evidence of Good Design

```javascript
// HTML Generator - Clean usage
class SimpleDocsGenerator extends SpecConsumerGeneratorBase {
  async generate() {
    return this.generateDocument('html', 'api-docs.html', (spec, services) => {
      return this.generateHTML(spec, services);
    });
  }
}

// Markdown Generator - Utilizes external tool template
class MarkdownGenerator extends SpecConsumerGeneratorBase {
  async generate() {
    return this.generateWithExternalTool('markdown', 'api-docs.md', 
      async (spec, services, outputPath) => {
        // External tool integration
      });
  }
}
```

## Consequences

### Keeping the Hierarchy
- **Positive**: Maintained code reuse, consistency, and proven patterns
- **Positive**: Clear separation between spec creation and consumption
- **Positive**: Template methods prevent code duplication across generators
- **Negative**: 308 lines in base class (but provides significant functionality)

### Alternative: Flattening Would Have
- **Negative**: Duplicated code across 5 generators
- **Negative**: Inconsistent error handling and service access
- **Negative**: Loss of template methods (`generateDocument`, `generateWithExternalTool`)
- **Negative**: More complex testing due to code duplication

## Metrics Supporting the Decision

- **Code Reuse**: Base classes eliminate ~50-100 lines per generator
- **Consistency**: All generators follow identical patterns
- **Maintenance**: Single place to update common functionality
- **Testing**: Shared test utilities and consistent test patterns

## Future Considerations

1. **Monitor Growth**: Watch for base class becoming too large (>500 lines)
2. **Extract Services**: If services become complex, consider composition over inheritance
3. **Split Base Classes**: If new generator types emerge, consider additional specialization

## Implementation Notes

The hierarchy strikes the right balance between:
- **Simplicity**: Clear inheritance chain (only 2 levels)
- **Functionality**: Substantial code reuse and consistency
- **Maintainability**: Proven patterns that work well for the team