# ADR-003: Plugin Registry vs Static Imports

## Status
Under Review

## Context
The confytome project needs to discover and execute different generators (HTML, Markdown, Swagger, etc.). Two main approaches were considered:

1. **Plugin Registry**: Dynamic discovery using manifest files and runtime loading
2. **Static Imports**: Direct imports of generator classes with explicit registration

Current implementation uses a plugin registry system with manifest files, but this may be over-engineered for the current scale of 4-5 generators.

## Current Implementation (Plugin Registry)
- GeneratorFactory dynamically discovers generators from manifest files
- Complex registry system with caching and validation
- Runtime plugin loading and compatibility checking
- CLI commands for plugin discovery and validation

## Alternative: Static Imports
- Direct imports of generator classes
- Explicit registration in a simple registry object
- Compile-time dependency resolution
- Simpler CLI execution without dynamic discovery

## Decision
**Recommend Migration to Static Registry** for current scale, with plugin system retained for future external plugin support.

## Evaluation Criteria

### Plugin Registry Advantages
- **Extensibility**: Easy to add new generators without code changes
- **External Plugins**: Supports third-party generator development
- **Runtime Discovery**: Can discover generators installed separately
- **Metadata**: Rich generator information and compatibility checking

### Static Imports Advantages  
- **Simplicity**: Straightforward imports and execution
- **Performance**: No runtime discovery overhead
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Type Safety**: Better TypeScript support and compile-time checks

### Questions to Resolve
1. Are there plans for external plugin development?
2. How often are the plugin discovery CLI commands used?
3. Is the current manifest system providing value beyond complexity?
4. Would static imports meet current and future needs?

## Evaluation Results (January 2025)

### Code Complexity Analysis
- **Current Plugin System**: 810 lines (GeneratorRegistry: 269, GeneratorFactory: 244, CLI plugins: 297)
- **Static Registry Proof-of-Concept**: ~120 lines
- **Complexity Reduction**: 85% reduction in codebase

### Current Usage Patterns
- **Total Generators**: 5 (all internal workspace packages)
- **External Plugins**: None currently in use
- **Plugin Discovery Commands**: Available but likely underused
- **Runtime Benefits**: Minimal for fixed set of generators

### Quantitative Comparison

| Aspect | Current Plugin System | Static Registry |
|--------|----------------------|----------------|
| Lines of Code | 810 | ~120 |
| File I/O Operations | Heavy (manifest reading, glob patterns) | None |
| Runtime Discovery | Yes | No |
| External Plugin Support | Ready | Requires plugin system |
| Bundle Size Impact | Larger (unused discovery code) | Smaller (tree-shakeable) |
| Type Safety | Limited | Full TypeScript support |
| Maintenance Overhead | High | Low |

## Recommendations

### Phase 1: Hybrid Approach (Immediate)
- Keep plugin system for `confytome generators`, `confytome info`, etc.
- Implement static registry for core generator execution
- Reduce plugin system complexity where possible

### Phase 2: Static Migration (Future)
- Migrate core generator execution to static registry
- Retain plugin system only for external plugin discovery
- Document external plugin development patterns

### Phase 3: Plugin System (As Needed)
- Expand plugin system when external plugins are actively developed
- Add plugin marketplace or registry features
- Implement plugin validation and sandboxing

## Implementation Notes

Static registry benefits for current scale:
- **Simplicity**: 85% less code to maintain
- **Performance**: No runtime discovery overhead  
- **Reliability**: Compile-time validation of all generators
- **Developer Experience**: Better IDE support and debugging

Plugin system benefits for future growth:
- **Extensibility**: Ready for external plugin ecosystem
- **Runtime Discovery**: Supports dynamic plugin installation
- **Metadata**: Rich generator information and compatibility