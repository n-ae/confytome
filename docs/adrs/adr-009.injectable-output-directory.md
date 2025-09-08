# ADR-009: Injectable Output Directory Configuration

## Status
**ACCEPTED** - Implemented in v1.4.2

## Context

The confytome project originally used hardcoded default output directories throughout the codebase, leading to:
- Multiple scattered references to `'./docs'` then `'./confytome'`
- Inconsistent configuration approaches across generators
- Difficulty in testing and customization
- Violation of single source of truth principles

During the transition from 'docs' to 'confytome' as the default output directory, we identified the need for a cleaner, more maintainable configuration approach that would:
1. Centralize configuration in a single source of truth
2. Enable dependency injection for better testability
3. Remove backwards compatibility code that added complexity
4. Maintain simplicity while enabling customization

## Decision

We implemented a **purely injectable output directory configuration system** with the following characteristics:

### Core Implementation
```javascript
// constants.js - Single source of truth
const DEFAULT_OUTPUT_DIR = './confytome';

export function getOutputDir(outputDir) {
  return outputDir || DEFAULT_OUTPUT_DIR;
}
```

### Key Principles
1. **Single Source of Truth**: One internal constant for the default value
2. **Pure Injection**: All components receive output directory via `getOutputDir()`
3. **No Environment Variables**: Removed `CONFYTOME_OUTPUT_DIR` support
4. **No Static Exports**: Removed `DEFAULT_OUTPUT_DIR` export
5. **Simple Logic**: `outputDir || DEFAULT_OUTPUT_DIR` - no complex fallbacks

### Implementation Pattern
- CLI commands: `getOutputDir(options.output)`
- Base generators: `getOutputDir(outputDir)` in constructors
- Helper functions: `getOutputDir(outputDir)` with parameter passing
- All generators: Consistent injectable pattern

## Alternatives Considered

### 1. Environment Variable Support
**Rejected** - Added complexity and multiple configuration sources
```javascript
// Rejected approach
if (process.env.CONFYTOME_OUTPUT_DIR) return process.env.CONFYTOME_OUTPUT_DIR;
```

### 2. Static Constant Exports
**Rejected** - Created tight coupling and testing difficulties
```javascript
// Rejected approach
export const DEFAULT_OUTPUT_DIR = './confytome';
```

### 3. Complex Configuration Objects
**Rejected** - Over-engineered for simple use case
```javascript
// Rejected approach
class ConfigManager {
  getOutputDir(override, envVar, default) { /* complex logic */ }
}
```

### 4. Required Parameters (No Defaults)
**Rejected** - Would break existing usage and user experience
```javascript
// Rejected approach
export function getOutputDir(outputDir) {
  if (!outputDir) throw new Error('Required');
  return outputDir;
}
```

## Consequences

### Positive
- **Single Source of Truth**: One place to change the default directory
- **Improved Testability**: Easy to inject test directories
- **Reduced Complexity**: No environment variables or multiple fallbacks
- **Consistent Interface**: All components use same `getOutputDir()` pattern
- **Clean Architecture**: Clear separation between default and override
- **Maintainability**: Simple logic, easy to understand and modify

### Negative
- **Breaking Change**: Removed environment variable support
- **Migration Required**: Updated all existing usage patterns
- **Less Flexible**: No runtime configuration via environment

### Mitigation
- **Documentation Updated**: Clear migration path in ADRs and README
- **Tests Updated**: All test scenarios account for new pattern
- **CLI Preserved**: User-facing `--output` option still works as expected

## Implementation Details

### Files Modified
- `packages/core/constants.js` - Core implementation
- `packages/core/cli.js` - CLI integration
- `packages/core/utils/cli-helpers.js` - Helper functions
- `packages/core/utils/base-generator.js` - Base classes
- `packages/html/generate-html.js` - Generator example
- All test files - Updated assertions and expectations

### Test Coverage
- 6 test cases covering injection behavior
- Default fallback testing
- Parameter override validation
- Integration with existing test suite (28 tests passing)

## Lessons Learned

1. **KISS Principle**: Simple injection pattern proved more maintainable than complex configuration systems
2. **Breaking Changes**: Sometimes necessary for long-term architectural health
3. **Single Source of Truth**: Internal constants better than exported constants for encapsulation
4. **Testing First**: Injectable patterns significantly improve testability

## Future Considerations

- Pattern established for other injectable configurations
- Template for similar architectural decisions
- Foundation for additional dependency injection if needed
- Example of backwards compatibility removal done thoughtfully

## References
- Related: ADR-005 (Configuration Merging)
- Related: ADR-002 (Base Generator Pattern)
- Implementation: packages/core/constants.js
- Tests: packages/core/test/injectable-config.test.js